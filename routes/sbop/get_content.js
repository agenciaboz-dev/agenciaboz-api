const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


/* GET users listing. */
router.post('/', function(request, response, next) {    
	const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();

    console.log(data)

    const sql = {
        Aspirante: `SELECT * FROM conteudos WHERE assinatura = 'Aspirante' AND categoria = ? ORDER BY id DESC`,
        Associado: `SELECT * FROM conteudos WHERE (assinatura = 'Aspirante' OR assinatura = 'Associado') AND categoria = ? ORDER BY id DESC`,
        Titular: `SELECT * FROM conteudos WHERE (assinatura = 'Aspirante' OR assinatura = 'Associado' OR assinatura = 'Titular') AND categoria = ? ORDER BY id DESC`,
    }

	mysql.query({
		sql: sql[data.assinatura],
		timeout: 40000, // 40s
		values: [
            data.categoria,
		]
	}, (error, results) => {
		if (error) console.error(error);
        response.json(results)
		mysql.end();
	});

});

router.post('/post', (request, response, next) => {
    const data = request.body

    const mysql = newMysql(config.sbop.database);
	mysql.connect();

    mysql.query({
        sql: `SELECT * FROM conteudos WHERE id = ?`,
        timeout: 40000,
        values: [data.id]
    }, (error, results) => {
        if (error) {
            console.error(error)
            mysql.end()
            response.json({ error })
        }

        console.log(results)
        mysql.end()
        response.json(results[0])
    })
})

module.exports = router;