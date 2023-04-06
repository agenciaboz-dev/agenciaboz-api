const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const { execSync, exec } = require('child_process')
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require('@prisma/client')
const rdstation = require('../../src/sion/rdstation')

const prisma = new PrismaClient()

router.post('/financial', async (request, response, next) => {    
    const data = request.body

    try {
        const financial = await prisma.financial.create({
            data: {
                name: data.name,
                phone: data.phone.replace(/\D/g, ''),
                email: data.email,
                contract_id: data.id
            }
        })

        response.json(financial)
    } catch {
        response.json(null)
    }


})

router.post('/unit', async (request, response, next) => {    
    const data = request.body

    const contract = await prisma.contracts.findUnique({
        where: { unit: data.unit }
    })

    response.json(contract ? {error: 'Unidade consumidora já cadastrada'} : {success: true})

    if (!contract) {
        const input = JSON.stringify(data).replaceAll('"', "'")
        const command = `python3 src/sion/unit.py "${input}"`
        console.log(command)
        const output = execSync(command)
        console.log(output.toString())
    }
    
})

router.post('/lead', async (request, response, next) => {    
    const data = request.body
    data.date = new Date()

    if ('emails' in data) {
        data.email = data.emails.toString()
    }

    try {
        const contract = await prisma.contracts.create({
            data: {
                unit: data.unit,
                date: data.date,
                ip: request.socket.remoteAddress,
                pessoa: data.pessoa,
                supplier: data.supplier,
                name: data.name,
                email: data.email,
                phone: data.phone.replace(/\D/g, ''),
                address: data.address,
                cep: data.cep.replace(/\D/g, ''),
                cnpj: data.cnpj?.replace(/\D/g, ''),
                company: data.company,
                category: data.category,
                cpf: data.cpf?.replace(/\D/g, ''),
                rg: data.rg?.replace(/\D/g, ''),
                seller_id: data.seller.id,
            },
            include: {
                seller: true
            }
        })
        response.json(contract)

        rdstation.organization(data, (data => {
            const organization = data._id

            const lead = rdstation.lead({
                id: contract.id,
                contacts: [{
                    emails: [contract.email.split(',').map(email => { email })],
                    name: contract.name,
                    phones: [{ phone: contract.phone }]
                }],
                deal: {
                    deal_stage_id: "603392f33553ba0017383e14",
                    name: (contract.company || contract.name) + ` / ${contract.unit}`,
                    user_id: "6422e7534495ab000b1b42cb"
                },
                organization: { _id: organization }
            })
        }))

        const input = { ...contract }

        input.template = 'lead'
        input.mail_subject = 'Sion - Novo lead'
        input.mail_list = [input.seller.email] // mudar para email da sion
        
        exec(`python3 src/sion/send_mail.py "${JSON.stringify(input).replaceAll('"', "'")}"`, (error, stdout, stderr) => {
            console.log(error)
            console.log(stderr)
            console.log(stdout)
        })
        
    } catch(error) {
        // console.log(error)
        // response.json(null)
    }

})

router.post('/send', async (request, response, next) => {    
    const data = request.body

    rdstation.sign(data)

    if ('emails' in data) {
        data.email = data.emails.toString()
    }

    const seller = data.seller

    data.template = 'contract'
    data.mail_subject = 'Sion - Contrato'
    const mail_list = [...data.email.split(','), seller.email] // falta email da sion

    // data 1 mes a partir de agora
    const data1m = new Date()
    data1m.setMonth(data1m.getMonth() + 1);
    data.sign_limit = data1m.toLocaleDateString('pt-br');

    mail_list.map(mail => {
        data.mail_list = [mail]

        const input = JSON.stringify(data).replaceAll('"', "'")
        exec(`python3 src/sion/send_mail.py "${input}"`, (error, stdout, stderr) => {
            console.log(stdout)
            console.log(error)
            console.log(stderr)
        })
    })
    
    
})

router.post('/generate', async (request, response, next) => { 
	const data = JSON.parse(request.body.data);
    data.date = new Date()
    
    const files = request.files

	const contract = await prisma.contracts.findUnique({ where: { unit: data.unit }, include: { seller: true } })

    contract.date = contract.date.toLocaleDateString('pt-BR')

    // Create an 'uploads' folder if it doesn't exist
    const uploadsDir = `documents/sion/${contract.unit}`
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Iterate through the files and save them
    Object.entries(files).forEach(([key, file]) => {
        const filePath = path.join(uploadsDir, file.name);
        console.log(filePath)
        file.mv(filePath, (err) => {
            if (err) {
                console.error("Error saving file:", err);
                return res.status(500).json({ error: "Error saving file" });
            }
        })
    });

    console.log(contract)

    const input = JSON.stringify(contract).replaceAll('"', "'")
    const generate_contract = `python3 src/sion/contract.py "${input}"`
    exec(generate_contract, (error, stdout, stderr) => {
        console.log(stdout)

        response.json({success: true})
        

        exec(`python3 src/sion/upload.py "${input}"`, (error, stdout, stderr) => {
            console.log(stdout)

        })
    })

    await prisma.logs.create({ data: {
        contract_id: contract.id,
        seller_id: contract.seller_id,
        text: `Operador com email ${contract.seller.email} criou este documento número ${contract.id}. Data limite para assinatura do documento: ${new Date().setMonth(data.date.getMonth() + 1)}.`
    }})

    await prisma.logs.create({ data: {
        contract_id: contract.id,
        seller_id: contract.seller_id,
        text: `Operador com email ${contract.seller.email} adicionou à Lista de Assinatura:  ${contract.email} para assinar como parte, via E-mail, com os pontos de autenticação: Token via E-mail; Nome Completo; CPF; Biometria Facial; Endereço de IP.`
    }})

    await prisma.logs.create({ data: {
        contract_id: contract.id,
        seller_id: contract.seller_id,
        text: `Operador com email ${contract.seller.email} adicionou à Lista de Assinatura:  [EMAIL DA SION] para assinar como parte, via E-mail, com os pontos de autenticação: Token via E-mail; Nome Completo; CPF; Biometria Facial; Endereço de IP.`
    }})

    await prisma.logs.create({ data: {
        contract_id: contract.id,
        seller_id: contract.seller_id,
        text: `Operador com email ${contract.seller.email} adicionou à Lista de Assinatura:  ${contract.seller.email} para assinar como parte, via E-mail, com os pontos de autenticação: Token via E-mail; Nome Completo; CPF; Biometria Facial; Endereço de IP.`
    }})
        
});

router.post('/confirm', async (request, response, next) => {   
    const generateRandomNumber = (length) => {
        const min = Math.pow(10, length - 1)
        const max = Math.pow(10, length) - 1
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    const data = JSON.parse(request.body.data);
    data.id = parseInt(data.id)
    data.document = data.document.replace(/\D/g, '')
    console.log(data)
    
    const files = request.files

    let contract = null

    const user = data.user
    if (user) {
        contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })
        if (contract) contract.mail_list = [contract.seller.email]
        if ((contract.seller.cpf != data.document) || (contract.seller.name != data.name)) contract = null

    } else {
        contract = await prisma.contracts.findFirst({ where: { 
            OR: [{ cpf: data.document }, { cnpj: data.document }],
            AND: [{ id: data.id }]
        }, include: { seller: true }})
        contract.mail_list = [contract.email]
    }

    if (contract) contract.token = generateRandomNumber(5)

    console.log(contract)

    response.json(contract)

    if (contract) {
        contract.template = 'token'
        data.mail_subject = contract.token + ' - Token de autenticação - Sion - Contrato'
        const input = JSON.stringify(contract).replaceAll('"', "'")
        exec(`python3 src/sion/send_mail.py "${input}"`, (error, stdout, stderr) => {
            console.log(stdout)
            console.log(error)
            console.log(stderr)
        })
    }

})

router.post('/sign', async (request, response, next) => {    
    const data = request.body

    const contract = await prisma.contracts.findUnique({ where: { id: data.id }, include: { seller: true } })

    const document = data.cpf ? 'CPF' : 'CNPJ'

    await prisma.logs.create({ data: {
        contract_id: contract.id,
        seller_id: contract.seller_id,
        text: `${data.name} assinou como parte. Pontos de autenticação: Token via E-mail ${data.email} ${document} informado: ${data.cpf || data.cnpj}. Biometria Facial: [Link da imagem no drive]. IP: ${request.socket.remoteAddress}.`
    }})

    rdstation.closed(data)
})

module.exports = router;
