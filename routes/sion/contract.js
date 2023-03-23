const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const { execSync } = require('child_process')
const fs = require("fs");
const path = require("path");

router.post('/new', (request, response, next) => {    
	const data = JSON.parse(request.body.data);
    data.date = new Date()
    
    const files = request.files

	const mysql = newMysql(config.sion.database);
	mysql.connect();

    mysql.query({
        sql: "INSERT INTO contracts (unit, date, pessoa, supplier, discount, profit, name, email, phone, address, number, district, cnpj, company, category, curriculum, cpf, rg, cep, civil, nationality, profession) VALUES (?)",
        values: [[
            data.unit,
            data.date,
            data.pessoa,
            data.supplier,
            parseInt(data.discount.replaceAll(' ', '').replaceAll('%', '').split(',')[0]),
            parseInt(data.profit.replaceAll(' ', '').replaceAll('%', '').split(',')[0]),
            data.name,
            data.email,
            data.phone.replaceAll('(', '').replaceAll('-', '').replaceAll(')', '').replaceAll(' ', ''),
            data.address,
            data.number,
            data.district,
            data.cnpj?.replaceAll('.', '').replaceAll('-', '').replaceAll('/', ''),
            data.company,
            data.category,
            data.curriculum,
            data.cpf?.replaceAll('.', '').replaceAll('-', ''),
            data.rg?.replaceAll('.', '').replaceAll('-', ''),
            data.cep?.replaceAll('.', '').replaceAll('-', ''),
            data.civil,
            data.nationality,
            data.profession
        ]]
    }, (error, results) => {
        if (error) {
            // console.error(error)
            // response.json({error: error.sqlMessage.includes('unit') && 'Unidade consumidora'})
        } else {

            data.id = results.insertId
            data.date = data.date.toLocaleDateString('pt-BR')
            response.json(results)

            // Create an 'uploads' folder if it doesn't exist
            const uploadsDir = `documents/sion/${data.id}`
            console.log(uploadsDir)
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

            const input = JSON.stringify(data).replaceAll('"', "'")
            const command = `python3 src/sion/contract.py "${input}"`
            console.log(command)
            execSync(command)
            // execSync(`chown agenciaboz:agenciaboz /home/agenciaboz/dev.agenciaboz.com.br/static/documents/${member.id}/certificate.pdf`)
    
        }

    })
	
        
});

module.exports = router;
