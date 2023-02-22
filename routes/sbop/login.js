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
		sql: `SELECT * FROM Membros WHERE user = ${mysql.escape(data.login)} AND senha = ${mysql.escape(data.password)} ;`,
		timeout: 40000, // 40s
		values: {
			USUÁRIO: data.login,
			SENHA: data.password,
		}
	}, (error, results) => {
		if (error) console.error(error);
		console.log(results);
		response.json(results);
		mysql.end();
	});


});

router.post('/pagseguro', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();
	
	mysql.query({
		sql: `SELECT * FROM Membros WHERE id = ? ;`,
		timeout: 40000, // 40s
		values: [ data.id ]
	}, (error, results) => {
		if (error) console.error(error);
		response.json(results);
		mysql.end();
	});


});

module.exports = router;