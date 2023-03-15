const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


router.get('/', function(request, response, next) {    
	const mysql = newMysql(config.sbop.database);
	mysql.connect();

	mysql.query({
		sql: 'SELECT * FROM categorias ORDER BY id',
		timeout: 40000, // 40s
	}, (error, results) => {
		if (error) console.error(error);
        response.json(results)
		mysql.end();
	});


});

module.exports = router;