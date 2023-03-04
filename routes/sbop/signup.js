const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')

router.post('/full', (request, response) => {
    const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();

    mysql.query({
        sql: "update Membros set nome = ?, uf = ?, cep = ?, email = ?, endereco = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, curriculum = ?, pais = ?, crm = ?, cpf = ?, lat = ?, lng = ?, need_location = ?, especialidades = ?, telefone = ? where id = ?",
        values: [
            data.name,
            data.uf,
            data.cep,
            data.email,
            data.endereco,
            data.numero,
            data.complemento,
            data.bairro,
            data.cidade,
            data.curriculum,
            'BR',
            data.crm,
            data.cpf,
            0,
            0,
            true,
            data.especialidades.toString(),
            data.telefone,
            data.id 
        ]
    }, (error, results) => {
        if (error) console.error(error);

        response.json(results)
        mysql.end()
    })

})

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
                sql: "update Membros set nome = ?, senha = ?, cpf = ?, crm = ?, email = ?, temporario = true, primeiro_acesso = true where id = ?",
                values: [
                    data.name,
                    data.cpf,
                    data.cpf,
                    `${data.crm}-${data.uf}`,
                    data.email,
                    user.id
                ]
            }, (error, results) => {
		        if (error) console.error(error);

                response.json(results)
                mysql.end()
            })
        } else {
            mysql.query({
                sql: "insert into Membros (user, senha, nome, email, pais, crm, primeiro_acesso, temporario, cpf, lat, lng, need_location, pago, especialidades, telefone, celular) values (?)",
                values: [[
                    data.email.split('@')[0],
                    data.cpf,
                    data.name,
                    data.email,
                    'BR',
                    `${data.crm}-${data.uf}`,
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