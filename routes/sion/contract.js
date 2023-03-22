const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')

router.post('/new', (request, response, next) => {    
	const data = request.body;
    console.log(data)

	const mysql = newMysql(config.sion.database);
	mysql.connect();

    mysql.query({
        sql: "INSERT INTO contracts (date, pessoa, supplier, discount, profit, name, email, phone, address, number, district, cnpj, company, category, curriculum, cpf, rg, cep, civil, nationality, profession) VALUES (?)",
        values: [[
            new Date(),
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
        if (error) console.error(error);

        console.log(results)
        response.json(results)
        mysql.end()
    })
	
        
});

module.exports = router;
