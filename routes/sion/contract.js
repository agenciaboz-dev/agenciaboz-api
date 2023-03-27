const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const { execSync } = require('child_process')

router.post('/new', (request, response, next) => {    
	const data = request.body;
    data.date = new Date()
    console.log(data)

	const mysql = newMysql(config.sion.database);
	mysql.connect();

    mysql.query({
        sql: "INSERT INTO contracts (unit, date, pessoa, supplier, name, email, phone, address, cep, cnpj, company, category, cpf, rg) VALUES (?)",
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
        ]]
    }, (error, results) => {
        if (error) {
            // console.error(error)
            // response.json({error: error.sqlMessage.includes('unit') && 'Unidade consumidora'})
        } else {

            data.id = results.insertId
            data.date = data.date.toLocaleDateString('pt-BR')

            const input = JSON.stringify(data).replaceAll('"', "'")
            const command = `python3 src/sion/contract.py "${input}"`
            console.log(command)
            execSync(command)
            // execSync(`chown agenciaboz:agenciaboz /home/agenciaboz/dev.agenciaboz.com.br/static/documents/${member.id}/certificate.pdf`)
    
            response.json(results)
        }

    })
	
        
});

module.exports = router;
