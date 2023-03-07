const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


router.post('/', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();
	
	mysql.query({
		sql: `SELECT * FROM Membros WHERE id = ? ;`,
		timeout: 40000, // 40s
		values: [ data.id ]
	}, (error, results) => {
		if (error) console.error(error);
		const member = results[0]
        console.log(member)

        member.pago = Boolean(+member.pago)
        member.temporario = Boolean(+member.temporario)
        member.primeiro_acesso = +member.primeiro_acesso
        member.especialidades = member.especialidades.split(',')

        response.json(member)
		mysql.end();
	});


});

router.post('/update/password', (request, response) => {
    const data = request.body
    const mysql = newMysql(config.sbop.database)
    mysql.connect()

    mysql.query({
        sql: "update Membros set senha = ?, primeiro_acesso = false where id = ?",
        values: [ data.password, data.id ]
    }, (error, results) => {
        if (error) console.error(error)
        response.json(results)
    })
})

router.post('/update/temporario', (request, response) => {
    const data = request.body
    const mysql = newMysql(config.sbop.database)
    mysql.connect()

    mysql.query({
        sql: "update Membros set temporario = 'False' where id = ?",
        values: [ data.id ]
    }, (error, results) => {
        if (error) console.error(error)
        response.json(results)
    })
})

module.exports = router;