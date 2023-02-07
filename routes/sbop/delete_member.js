const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


/* GET users listing. */
router.post('/', function(request, response, next) {    
	const data = request.body;

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
            sql: "INSERT INTO deletions_log (name, cpf, email, deleter_id) VALUES (?)",
            values: [ [user.nome, user.cpf, user.email, data.deleter] ]
        }, (error, results) => {
            if (error) console.error(error);
        })
    })


});

module.exports = router;