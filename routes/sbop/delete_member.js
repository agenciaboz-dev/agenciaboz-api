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
		sql: `DELETE FROM Membros WHERE id = ?`,
		timeout: 40000, // 40s
		values: [
			data.id,
		]
	}, (error, results) => {
		if (error) console.error(error);
        response.json({success: 'Sucesso'})
		mysql.end();
	});


});

module.exports = router;