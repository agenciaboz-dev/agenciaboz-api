const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const { execSync, exec } = require('child_process')
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require('@prisma/client')
const rdstation = require('../../src/sion/rdstation')
const omie = require('../../src/sion/omie')
const weni = require("../../src/sion/weni")
const pdf = require("../../src/pdf_handler.js")
const { default: axios } = require("axios")
const io = require("../../src/io")

const prisma = new PrismaClient()
const mails = {
    leads: "rafael.zella@sionenergia.com.br",
    contract: "eduardo.lucas@sionenergia.com.br",
}

router.get("/", async (request, response, next) => {
    const connected = io.connected
    response.json({ connected })
})

router.post("/", async (request, response, next) => {
    const data = request.body
    console.log({ data })

    const contract = await prisma.contracts.findUnique({ where: { id: Number(data.id) }, include: { seller: true } })
    response.json(contract)
})

router.post("/financial", async (request, response, next) => {
    const data = request.body

    try {
        const financial = await prisma.financial.create({
            data: {
                name: data.name,
                phone: data.phone.replace(/\D/g, ""),
                email: data.email,
                login: data.login,
                password: data.password,
                contract_id: data.id,
            },
        })

        response.json(financial)

        weni.add(financial)
    } catch (error) {
        console.error(error)
        response.json(null)
    }
})

router.post("/unit", async (request, response, next) => {
    const data = request.body

    const contract = await prisma.contracts.findUnique({
        where: { unit: data.unit },
    })

    console.log()

    response.json(contract ? { error: "Unidade consumidora já cadastrada" } : { success: true })

    if (data.seller && !contract) {
        const input = JSON.stringify(data).replaceAll('"', "'")
        const command = `python3 src/sion/unit.py "${input}"`
        console.log(command)
        const output = execSync(command)
        console.log(output.toString())
    }
})

router.post("/lead", async (request, response, next) => {
    const data = request.body
    data.date = new Date()

    if ("emails" in data) {
        data.email = data.emails.toString()
    }

    try {
        const contract = await prisma.contracts.create({
            data: {
                unit: data.unit,
                subunits: data.subunits,
                date: data.date,
                ip: request.ip,
                pessoa: data.pessoa,
                supplier: data.supplier,
                name: data.name,
                birth: new Date(data.birth),
                email: data.email,
                phone: data.phone.replace(/\D/g, ""),
                cep: data.cep.replace(/\D/g, ""),
                district: data.cep,
                number: data.number,
                city: data.city,
                state: data.state,
                address: data.address,
                cnpj: data.cnpj?.replace(/\D/g, ""),
                company: data.company,
                category: data.category,
                cpf: data.cpf?.replace(/\D/g, ""),
                rg: data.rg?.replace(/\D/g, ""),
                seller_id: data.seller.id,
            },
            include: {
                seller: true,
            },
        })
        response.json(contract)

        omie.signup(contract)

        rdstation.organization(data, (data) => {
            const organization = data._id

            const lead = rdstation.lead({
                id: contract.id,
                contacts: [
                    {
                        emails: [
                            contract.email.split(",").map((email) => {
                                email
                            }),
                        ],
                        name: contract.name,
                        phones: [{ phone: contract.phone }],
                    },
                ],
                deal: {
                    deal_stage_id: "603392f33553ba0017383e14",
                    name: (contract.company || contract.name) + ` / ${contract.unit}`,
                    user_id: "6422e7534495ab000b1b42cb",
                },
                organization: { _id: organization },
            })
        })

        const input = { ...contract }

        input.template = "lead"
        input.mail_subject = "Sion - Novo lead"
        input.mail_list = [mails.leads]

        exec(`python3 src/sion/send_mail.py "${JSON.stringify(input).replaceAll('"', "'")}"`, (error, stdout, stderr) => {
            console.log(error)
            console.log(stderr)
            console.log(stdout)
        })
    } catch (error) {
        console.log(data)
        console.log(error)
        // response.json(null)
    }
})

router.post("/send", async (request, response, next) => {
    const data = request.body

    rdstation.sign(data)

    if ("emails" in data) {
        data.email = data.emails.toString()
    }

    const contract = await prisma.contracts.findUnique({ where: { id: data.id } })

    const seller = data.seller

    data.template = "contract"
    data.mail_subject = "Sion - Contrato"
    const mail_list = [...data.email.split(",")]

    // data 1 mes a partir de agora
    const data1m = new Date()
    data1m.setMonth(data1m.getMonth() + 1)
    data.sign_limit = data1m.toLocaleDateString("pt-br")
    data.filename = contract.filename

    mail_list.map((mail) => {
        data.mail_list = [mail]
        data.signing = "client"

        const input = JSON.stringify(data).replaceAll('"', "'")
        exec(`python3 src/sion/send_contract_mail.py "${input}"`, (error, stdout, stderr) => {
            console.log(stdout)
            console.log(error)
            console.log(stderr)
        })
    })
})

router.post("/generate", async (request, response, next) => {
    const data = JSON.parse(request.body.data)
    data.date = new Date()

    const files = request.files

    const contract = await prisma.contracts.findUnique({ where: { unit: data.unit }, include: { seller: true } })
    // omie.bill(contract)

    console.log(contract)

    contract.date = contract.date.toLocaleDateString("pt-BR")

    // Create an 'uploads' folder if it doesn't exist
    const uploadsDir = `documents/sion/${contract.unit}`
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Iterate through the files and save them
    Object.entries(files).forEach(([key, file]) => {
        const filePath = path.join(uploadsDir, file.name)
        console.log(filePath)
        file.mv(filePath, (err) => {
            if (err) {
                console.error("Error saving file:", err)
                return res.status(500).json({ error: "Error saving file" })
            }
        })
    })

    response.json({ success: true })

    const logs = []

    logs.push(
        await prisma.logs.create({
            data: {
                contract_id: contract.id,
                seller_id: contract.seller_id,
                text: `Operador com email ${contract.seller.email} criou este documento número ${
                    contract.id
                }. Data limite para assinatura do documento: ${new Date(new Date().setMonth(data.date.getMonth() + 1)).toLocaleDateString("pt-BR")}.`,
            },
        })
    )

    logs.push(
        await prisma.logs.create({
            data: {
                contract_id: contract.id,
                seller_id: contract.seller_id,
                text: `Operador com email ${contract.seller.email} adicionou à Lista de Assinatura:  ${contract.email} para assinar como parte, via E-mail, com os pontos de autenticação: Token via E-mail; Nome Completo; CPF; Documentação; Endereço de IP.`,
            },
        })
    )

    logs.push(
        await prisma.logs.create({
            data: {
                contract_id: contract.id,
                seller_id: contract.seller_id,
                text: `Operador com email ${contract.seller.email} adicionou à Lista de Assinatura:  ${mails.contract} para assinar como parte, via E-mail, com os pontos de autenticação: Token via E-mail; Nome Completo; CPF; Documentação; Endereço de IP.`,
            },
        })
    )

    logs.push(
        await prisma.logs.create({
            data: {
                contract_id: contract.id,
                seller_id: contract.seller_id,
                text: `Operador com email ${contract.seller.email} adicionou à Lista de Assinatura:  ${contract.seller.email} para assinar como testemunha, via E-mail, com os pontos de autenticação: Token via E-mail; Nome Completo; CPF; Documentação; Endereço de IP.`,
            },
        })
    )

    // building contract

    contract.birthdate = contract.birth.toLocaleDateString("pt-BR")
    console.log(contract)

    const fields = []
    // mapping contract to build every field from it's keys
    Object.entries(contract).map(([key, value]) => {
        if (key == "unit") {
            fields.push({ name: key, value: `${contract.unit}${contract.subunits ? ", " + contract.subunits : ""}` })
        } else {
            fields.push({ name: key, value })
        }
    })
    console.log(fields)

    // signatures
    fields.push({ name: "sion.name", value: "Sion Energia", bold: true })
    fields.push({ name: "sion.cpf", value: "CPF: 05003138903" })
    fields.push({ name: "seller.name", value: contract.seller.name, bold: true })
    fields.push({ name: "seller.cpf", value: `CPF: ${contract.seller.cpf}` })
    fields.push({ name: "contract.name", value: contract.name, bold: true })
    fields.push({ name: "contract.cpf", value: `CPF: ${contract.cpf}` })

    // mapping logs to build datetime and text logs fields
    logs.map((log) => {
        const index = logs.indexOf(log) + 1
        fields.push({
            name: `log_${index}_datetime`,
            value: log.date.toLocaleString("pt-BR"),
        })

        fields.push({
            name: `log_${index}_text`,
            value: log.text,
        })
    })

    const filename = `documents/sion/${contract.unit}/Contrato-${(contract.company || contract.name).replace(/ /g, "")}-${data.date
        .toLocaleDateString("pt-BR")
        .replace(/\//g, "_")}.pdf`

    // filling pdf form
    await pdf.fillForm({
        pdfPath: `src/sion/templates/contract.${contract.pessoa}.pdf`,
        outputPath: filename,
        font: { regular: "Poppins-Regular.ttf", bold: "Poppins-Bold.ttf" },
        fields,
    })

    const input = JSON.stringify(contract).replaceAll('"', "'")
    exec(`python3 src/sion/upload.py "${input}"`, (error, stdout, stderr) => {
        console.log(stdout)
    })

    const newContract = await prisma.contracts.update({ data: { filename }, where: { id: contract.id }, include: { seller: true, status: true } })
    newContract.status = { id: 1 }
    io.emit("contract:new", newContract)
})

router.post("/confirm", async (request, response, next) => {
    const generateRandomNumber = (length) => {
        const min = Math.pow(10, length - 1)
        const max = Math.pow(10, length) - 1
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    const data = JSON.parse(request.body.data)
    data.id = parseInt(data.id)
    data.document = data.document.replace(/\D/g, "")
    data.birth = new Date(data.birth).getTime()
    console.log(data)

    const files = request.files

    let contract = null

    const user = data.user
    if (data.signing == "sion") {
        contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
        const signed = !!contract.signatures
        const signatures = signed ? contract.signatures.split(",") : []
        contract.signed = signatures.includes(user.email)
        if (contract) contract.mail_list = [mails.contract]
    } else if (data.signing == "seller") {
        contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
        const signed = !!contract.signatures
        const signatures = signed ? contract.signatures.split(",") : []
        contract.signed = signatures.includes(contract.seller.email)
        if (
            contract.seller.cpf != data.document ||
            contract.seller.name.trim().toLowerCase() != data.name.trim().toLowerCase() ||
            new Date(contract.seller.birth).getTime() != data.birth
        )
            contract = null
        if (contract) contract.mail_list = [contract.seller.email]
    } else {
        contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
        const signed = !!contract.signatures
        const signatures = signed ? contract.signatures.split(",") : []
        contract.signed = signatures.includes(contract.email)
        if (contract) contract.mail_list = [contract.email]
        console.log(new Date(contract.birth).getTime())
        if (
            (contract.cpf != data.document && contract.cnpj != data.document) ||
            contract.name.trim().toLowerCase() != data.name.trim().toLowerCase() ||
            new Date(contract.birth).getTime() != data.birth
        )
            contract = null
    }

    if (contract) contract.token = generateRandomNumber(5)

    console.log(contract)

    if (contract) {
        contract.rubric = data.rubric
        contract.template = "token"
        contract.mail_subject = contract.token + " - Token de autenticação - Sion - Contrato"
        const input = JSON.stringify(contract).replaceAll('"', "'")
        exec(`python3 src/sion/send_mail.py "${input}"`, (error, stdout, stderr) => {
            console.log(stdout)
            console.log(error)
            console.log(stderr)
        })

        if (data.signing == "client") {
            axios
                .post("https://app.agenciaboz.com.br:4101/api/whatsapp/token", {
                    number: contract.phone,
                    token: contract.token,
                })
                .then((response) => console.log(response.data))
        }

        const uploadsDir = `documents/sion/${contract.unit}`
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Iterate through the files and save them
        Object.entries(files).forEach(([key, file]) => {
            const filePath = path.join(uploadsDir, file.name)
            console.log(filePath)
            contract.upload_file = file.name
            contract.biometry = filePath
            file.mv(filePath, (err) => {
                if (err) {
                    console.error("Error saving file:", err)
                }
            })
        })

        const upload_input = JSON.stringify(contract).replaceAll('"', "'")

        exec(`python3 src/sion/upload_file.py "${upload_input}"`, (error, stdout, stderr) => {
            console.log(stdout)
        })
    }

    response.json(contract)
})

router.post("/sign", async (request, response, next) => {
    const data = request.body

    const contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
    const signed = !!contract.signatures
    const signatures = signed ? contract.signatures.split(",") : []

    if (!signatures.includes(data.signing)) {
        response.json({ success: true })
        signatures.push(data.signing)

        data.mail_subject = "Sion - Contrato"

        // data 1 mes a partir de agora
        const data1m = new Date()
        data1m.setMonth(data1m.getMonth() + 1)
        data.sign_limit = data1m.toLocaleDateString("pt-br")
        data.pessoa = contract.pessoa
        data.filename = contract.filename

        const signing = data.signing
        if (data.signing == "client") {
            data.signing = "seller"
            data.mail_list = [contract.seller.email]
        } else if (data.signing == "seller") {
            data.signing = "sion"
            data.mail_list = [mails.contract]
        }

        console.log("......")
        console.log(`sending contract to ${data.mail_list}`)
        console.log("......")
        const input = JSON.stringify(data).replaceAll('"', "'")
        exec(`python3 src/sion/send_contract_mail.py "${input}"`, (error, stdout, stderr) => {
            console.log(stdout)
            console.log(error)
            console.log(stderr)
        })

        data.signing = signing

        const sign_type = data.signing == "seller" ? "testemunha" : "parte"

        const sign_name = data.signing == "seller" ? contract.seller.name : data.signing == "client" ? contract.name : "Cooperativa Sion"

        const sign_email = data.signing == "seller" ? contract.seller.email : data.signing == "client" ? contract.email : mails.contract

        const sign_cpf = data.signing == "seller" ? contract.seller.cpf : data.signing == "client" ? contract.cpf : "05003138903"

        await prisma.logs.create({
            data: {
                contract_id: contract.id,
                seller_id: contract.seller_id,
                text: `${sign_name} assinou como ${sign_type}. Pontos de autenticação: Token via E-mail ${sign_email} CPF informado: ${sign_cpf}. Documentação: https://app.agenciaboz.com.br:4000/${data.biometry}. IP: ${request.ip}.`,
            },
        })

        const newContract = await prisma.contracts.update({
            where: { id: contract.id },
            data: { signatures: signatures.toString() },
            include: { seller: true, status: true },
        })
        newContract.status = { id: 1 }
        io.emit("contract:update", newContract)

        if (data.signing == "sion") {
            rdstation.closed(data)
            // omie.bill(contract)
            // arrumar aqui
            await prisma.logs.create({
                data: {
                    contract_id: contract.id,
                    seller_id: contract.seller_id,
                    text: `O processo de assinatura foi finalizado automaticamente. Motivo: finalização automática após a última assinatura habilitada. Processo de assinatura concluído para o documento número  ${contract.id}.`,
                },
            })
        }

        const fields = []
        const field_name = data.signing == "client" ? "contract" : data.signing

        fields.push({
            name: field_name + ".signed",
            value: `Assinou como ${sign_type} em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
        })

        await pdf.updateImage({
            pdfPath: contract.filename,
            outputPath: contract.filename,
            field: field_name + "_check",
            image: "sion/images/check.png",
        })

        field_name != "seller" &&
            (await pdf.updateImage({
                pdfPath: contract.filename,
                outputPath: contract.filename,
                field: field_name + ".rubric",
                base64: data.rubric,
            }))

        const logs = await prisma.logs.findMany({ where: { contract_id: contract.id } })
        logs.map((log) => {
            const index = logs.indexOf(log) + 1
            fields.push({
                name: `log_${index}_datetime`,
                value: log.date.toLocaleString("pt-BR"),
            })

            fields.push({
                name: `log_${index}_text`,
                value: log.text,
            })
        })

        await pdf.fillForm({
            pdfPath: contract.filename,
            outputPath: contract.filename,
            font: { regular: "Poppins-Regular.ttf", bold: "Poppins-Bold.ttf" },
            fields,
        })

        contract.upload_file = contract.filename
        const upload_input = JSON.stringify(contract).replaceAll('"', "'")

        exec(`python3 src/sion/upload_file.py "${upload_input}"`, (error, stdout, stderr) => {
            console.log(stdout)
            console.log(stderr)
        })
    } else {
        response.json({ error: true })
    }
})

module.exports = router;
