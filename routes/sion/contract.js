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

    const splittedBirth = data.birth.split("/")

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
                birth: new Date(`${splittedBirth[1]}/${splittedBirth[0]}/${splittedBirth[2]}`),
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
        axios
            .post("https://app.agenciaboz.com.br:4101/api/whatsapp/contract", {
                number: contract.phone.toString().replace(/\D/g, ""),
                signing: contract.email,
                link: `https://adesao.cooperativasion.com.br/contract/${contract.id}/client`,
                limit: data.sign_limit,
            })
            .then((response) => {})

        const input = JSON.stringify(data).replaceAll('"', "'")
        // exec(`python3 src/sion/send_contract_mail.py "${input}"`, (error, stdout, stderr) => {
        //     console.log(stdout)
        //     console.log(error)
        //     console.log(stderr)
        // })
    })
})

router.post("/generate", async (request, response, next) => {
    const data = JSON.parse(request.body.data)
    data.date = new Date()
    console.log({ data })

    const files = request.files

    const contract = await prisma.contracts.findUnique({ where: { unit: data.unit }, include: { seller: true } })
    const fernanda = await prisma.users.findFirst({ where: { username: "fernanda" } })
    const eduardo = await prisma.users.findFirst({ where: { username: "els" } })
    // omie.bill(contract)

    console.log(contract)

    const date = new Date(contract.date.getTime())
    date.setDate(date.getDate() + 1)
    contract.date = date.toLocaleDateString("pt-BR")

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
                text: `Operador com email ${contract.seller.email} adicionou à Lista de Assinatura:  ${eduardo.email} para assinar como parte, via E-mail, com os pontos de autenticação: Token via E-mail; Nome Completo; CPF; Documentação; Endereço de IP.`,
            },
        })
    )

    logs.push(
        await prisma.logs.create({
            data: {
                contract_id: contract.id,
                seller_id: contract.seller_id,
                text: `Operador com email ${contract.seller.email} adicionou à Lista de Assinatura:  ${fernanda.email} para assinar como testemunha, via E-mail, com os pontos de autenticação: Token via E-mail; Nome Completo; CPF; Documentação; Endereço de IP.`,
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
    fields.push({ name: "seller.name", value: fernanda.name, bold: true })
    fields.push({ name: "seller.cpf", value: `CPF: ${fernanda.cpf}` })
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

    const newContract = await prisma.contracts.update({ data: { filename }, where: { id: contract.id }, include: { seller: true } })
    console.log({ newContract })
    if (newContract) io.emit("contract:new", { ...newContract, status: { id: 1 } })

    axios
        .post("https://app.agenciaboz.com.br:4101/api/whatsapp/new", {
            number: fernanda.phone.toString().replace(/\D/g, ""),
            mail: fernanda.email,
            id: newContract.id,
        })
        .then((response) => {})
})

router.post("/confirm", async (request, response, next) => {
    const fernanda = await prisma.users.findFirst({ where: { username: "fernanda" } })
    const eduardo = await prisma.users.findFirst({ where: { username: "els" } })

    const generateRandomNumber = (length) => {
        const min = Math.pow(10, length - 1)
        const max = Math.pow(10, length) - 1
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    const data = JSON.parse(request.body.data)
    data.id = parseInt(data.id)
    data.document = data.document.replace(/\D/g, "")
    data.birth = new Date(data.birth).getTime()

    const files = request.files

    let contract = null

    if (data.signing == "sion") {
        contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
        if (
            eduardo.cpf.toString().replace(/\D/g, "") != data.document.toString().replace(/\D/g, "") ||
            eduardo.name.trim().toLowerCase() != data.name.trim().toLowerCase() ||
            new Date(eduardo.birth).getTime() != data.birth
        )
            contract = null
        if (contract) contract.mail_list = [eduardo.email]
    } else if (data.signing == "seller") {
        contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
        if (
            fernanda.cpf.toString().replace(/\D/g, "") != data.document.toString().replace(/\D/g, "") ||
            fernanda.name.trim().toLowerCase() != data.name.trim().toLowerCase() ||
            new Date(fernanda.birth).getTime() != data.birth
        )
            contract = null
        if (contract) contract.mail_list = [fernanda.email]
    } else {
        contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
        if (contract) contract.mail_list = [contract.email]
        if (
            (contract.cpf.toString().replace(/\D/g, "") != data.document.toString().replace(/\D/g, "") &&
                contract.cnpj.toString().replace(/\D/g, "") != data.document.toString().replace(/\D/g, "")) ||
            contract.name.trim().toLowerCase() != data.name.trim().toLowerCase() ||
            new Date(contract.birth).getTime() != data.birth
        )
            contract = null
    }

    if (contract) contract.token = generateRandomNumber(5)

    if (contract) {
        contract.rubric = data.rubric
        contract.template = "token"
        contract.mail_subject = contract.token + " - Token de autenticação - Sion - Contrato"
        const input = JSON.stringify(contract).replaceAll('"', "'")
        // exec(`python3 src/sion/send_mail.py "${input}"`, (error, stdout, stderr) => {
        //     // console.log(stdout)
        //     // console.log(error)
        //     // console.log(stderr)
        // })

        let dateLimit = new Date(contract.date)
        console.log(dateLimit)
        dateLimit.setMonth(dateLimit.getMonth() + 1)
        console.log(dateLimit)

        if (data.signing == "client") {
            axios
                .post("https://app.agenciaboz.com.br:4101/api/whatsapp/token", {
                    number: contract.phone.toString().replace(/\D/g, ""),
                    token: contract.token,
                    name: contract.name,
                    signing: contract.email,
                    limit: dateLimit.toLocaleDateString("pt-br"),
                })
                .then((response) => {})
        } else if (data.signing == "seller") {
            axios
                .post("https://app.agenciaboz.com.br:4101/api/whatsapp/token", {
                    number: fernanda.phone.toString().replace(/\D/g, ""),
                    token: contract.token,
                    name: fernanda.name,
                    signing: fernanda.email,
                    limit: dateLimit.toLocaleDateString("pt-br"),
                })
                .then((response) => {})
        } else if (data.signing == "sion") {
            axios
                .post("https://app.agenciaboz.com.br:4101/api/whatsapp/token", {
                    number: eduardo.phone.toString().replace(/\D/g, ""),
                    token: contract.token,
                    name: eduardo.name,
                    signing: eduardo.email,
                    limit: dateLimit.toLocaleDateString("pt-br"),
                })
                .then((response) => {})
        }

        const uploadsDir = `documents/sion/${contract.unit}`
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Iterate through the files and save them
        Object.entries(files).forEach(([key, file]) => {
            const filePath = path.join(uploadsDir, file.name)
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
            // console.log(stdout)
        })
    }

    response.json(contract)
})

router.post("/sign", async (request, response, next) => {
    const data = request.body

    const contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
    const fernanda = await prisma.users.findFirst({ where: { username: "fernanda" } })
    const eduardo = await prisma.users.findFirst({ where: { username: "els" } })
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
            data.mail_list = [fernanda.email]
            axios
                .post("https://app.agenciaboz.com.br:4101/api/whatsapp/contract", {
                    number: fernanda.phone.toString().replace(/\D/g, ""),
                    limit: data.sign_limit,
                    link: `https://adesao.cooperativasion.com.br/contract/${contract.id}/seller`,
                    signing: fernanda.email,
                })
                .then((response) => {})
        } else if (data.signing == "seller") {
            data.signing = "sion"
            data.mail_list = [eduardo.email]
            axios
                .post("https://app.agenciaboz.com.br:4101/api/whatsapp/contract", {
                    number: eduardo.phone.toString().replace(/\D/g, ""),
                    limit: data.sign_limit,
                    link: `https://adesao.cooperativasion.com.br/contract/${contract.id}/sion`,
                    signing: eduardo.email,
                })
                .then((response) => {})
        }

        console.log("......")
        console.log(`sending contract to ${data.mail_list}`)
        console.log("......")
        const input = JSON.stringify(data).replaceAll('"', "'")
        // exec(`python3 src/sion/send_contract_mail.py "${input}"`, (error, stdout, stderr) => {
        //     console.log(stdout)
        //     console.log(error)
        //     console.log(stderr)
        // })

        data.signing = signing

        const sign_type = data.signing == "seller" ? "testemunha" : "parte"

        const sign_name = data.signing == "seller" ? fernanda.name : data.signing == "client" ? contract.name : "Cooperativa Sion"

        const sign_email = data.signing == "seller" ? fernanda.email : data.signing == "client" ? contract.email : eduardo.email

        const sign_cpf = data.signing == "seller" ? fernanda.cpf : data.signing == "client" ? contract.cpf : eduardo.cpf

        const sign_phone = data.signing == "seller" ? fernanda.phone : data.signing == "client" ? contract.phone : eduardo.phone

        axios
            .post("https://app.agenciaboz.com.br:4101/api/whatsapp/signed", {
                number: sign_phone.toString().replace(/\D/g, ""),
                id: contract.id,
                signing: sign_email,
            })
            .then((response) => {})

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
            include: { seller: true },
        })
        io.emit("contract:update", { ...newContract, status: { id: 1 } })

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

        contract.upload_file = contract.filename.replace(`documents/sion/${contract.unit}/`, "")
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
