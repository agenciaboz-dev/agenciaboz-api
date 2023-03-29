const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const { execSync, exec } = require('child_process')
const fs = require("fs");
const path = require("path");

router.post('/unit', (request, response, next) => {    
    const data = request.body

    const mysql = newMysql(config.sion.database)
    mysql.connect()
    
    mysql.query({
        sql: `SELECT * FROM contracts WHERE unit = ?`,
        timeout: 40000, // 40s
        values: [
            data.unit,
        ]
    }, (error, results) => {
        if (error) console.error(error)

        const contract = results[0] 

        response.json(contract ? {error: 'Unidade consumidora já cadastrada'} : {success: true})

        if (!contract) {
            const input = JSON.stringify(data).replaceAll('"', "'")
            const command = `python3 src/sion/unit.py "${input}"`
            console.log(command)
            const output = execSync(command)
            console.log(output.toString())
        }

        mysql.end()
    })
})

router.post('/lead', (request, response, next) => {    
    const data = request.body
    data.date = new Date()

    if ('emails' in data) {
        data.email = data.emails.toString()
    }

    const mysql = newMysql(config.sion.database);
    mysql.connect();
    
    mysql.query({
        sql: "INSERT INTO contracts (unit, date, pessoa, supplier, name, email, phone, address, cep, cnpj, company, category, cpf, rg, seller, seller_name) VALUES (?)",
        values: [[
            data.unit,
            data.date,
            data.pessoa,
            data.supplier,
            data.name,
            data.email,
            data.phone.replaceAll('(', '').replaceAll('-', '').replaceAll(')', '').replaceAll(' ', ''),
            data.address,
            data.cep.replaceAll('.', '').replaceAll('-', ''),
            data.cnpj?.replaceAll('.', '').replaceAll('-', '').replaceAll('/', ''),
            data.company,
            data.category,
            data.cpf?.replaceAll('.', '').replaceAll('-', ''),
            data.rg?.replaceAll('.', '').replaceAll('-', ''),
            data.seller.id,
            data.seller.name,
        ]]
    }, (error, results) => {
        if (error) {
            console.error(error)
            response.json({error: error.sqlMessage.includes('unit') ? 'Unidade consumidora já cadastrada': 'Erro desconhecido na API'})
        } else {
            response.json({success: true})

            // consume api adding client to lead
        }
    })
})

router.post('/', (request, response, next) => {    
    const data = request.body

    
})

router.post('/generate', (request, response, next) => { 
	const data = JSON.parse(request.body.data);
    data.date = new Date()
    
    const files = request.files

	const mysql = newMysql(config.sion.database);
	mysql.connect();

    mysql.query({
        sql: "SELECT * FROM contracts where unit = ?",
        values: [ data.unit ]
    }, (error, results) => {

        const contract = results[0]

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

        // execSync(`chown agenciaboz:agenciaboz /home/agenciaboz/dev.agenciaboz.com.br/static/documents/${member.id}/certificate.pdf`)
    

    })
	
        
});

module.exports = router;
