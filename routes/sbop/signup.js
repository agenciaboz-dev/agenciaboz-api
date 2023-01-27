const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


/* GET users listing. */
router.post('/', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();
	
	mysql.query({
		sql: `SELECT * FROM Membros WHERE cpf = ? or email = ? or crm = ? ;`,
		timeout: 40000, // 40s
		values: [
			data.cpf,
			data.email,
			data.crm,
		]
	}, (error, results) => {
		if (error) console.error(error);
        const user = results[0]

        if (user) {
            mysql.query({
                sql: "update Membros set nome = ?, cpf = ?, crm = ?, email = ?, uf = ? where id = ?",
                values: [
                    data.name,
                    data.cpf,
                    data.crm,
                    data.email,
                    data.uf,
                    user.id
                ]
            }, (error, results) => {
		        if (error) console.error(error);

                response.json(results)
                mysql.end()
            })
        } else {
            mysql.query({
                sql: "insert into Membros (user, senha, nome, uf, email, pais, crm, primeiro_acesso, temporario, cpf, lat, lng, need_location, pago, especialidades, telefone, celular) values (?)",
                values: [[
                    data.email.split('@')[0],
                    data.cpf,
                    data.name,
                    data.uf,
                    data.email,
                    'BR',
                    data.crm,
                    'True',
                    'True',
                    data.cpf,
                    0,
                    0,
                    true,
                    'False',
                    '',
                    '',
                    '',
                ]]
            }, (error, results) => {
                if (error) console.error(error);

                response.json(results)
                mysql.end()
            })
        }
        
	});


});

module.exports = router;