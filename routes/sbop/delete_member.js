const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')

router.post('/', (request, response, next) => {    
	const data = request.body;
    console.log(data)

	const mysql = newMysql(config.sbop.database);
	mysql.connect();
	
	mysql.query({
        sql: "SELECT * FROM Membros WHERE id = ?",
        values: [ data.id ]
    }, (error, results) => {
        mysql.query({
            sql: `DELETE FROM Membros WHERE id = ?`,
            timeout: 40000, // 40s
            values: [
                data.id,
            ]
        }, (error, results) => {
            if (error) console.error(error);
            response.json({success: 'Sucesso'})
        });

        const user = results[0]
        mysql.query({
            sql: "SELECT nome FROM Membros WHERE id = ?",
            values: [ data.adm_id ]
        }, (error, results) => {
            const adm = results[0]
            mysql.query({
                sql: "INSERT INTO deletions_log (name, cpf, email, adm) VALUES (?)",
                values: [ [user.nome, user.cpf, user.email, adm.nome] ]
            }, (error, results) => {
                if (error) console.error(error);
            })
        })
    })


});

module.exports = router;