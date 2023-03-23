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
