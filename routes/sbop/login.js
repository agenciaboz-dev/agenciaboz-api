const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


router.post('/', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();
	
	mysql.query({
		sql: `SELECT * FROM Membros WHERE (user = ? OR cpf = ? OR telefone = ?) AND senha = ?`,
		timeout: 40000, // 40s
		values: [
			data.login,
			data.login,
			data.login,
			data.password,
        ]
	}, (error, results) => {
		if (error) console.error(error);
		console.log(results);

        const member = results[0]
        
        response.json(member || {error: 'no member found'})

		mysql.end();
	});
});


module.exports = router;