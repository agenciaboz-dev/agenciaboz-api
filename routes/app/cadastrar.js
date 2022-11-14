const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


/* GET users listing. */
router.post('/', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.app.database);
	mysql.connect();

    const columns = ['name', 'user', 'password', 'type', 'cpf', 'email', 'birthday', 'role']

    console.log(data)
	
	mysql.query({
		sql: `INSERT INTO users (${columns}) VALUES (?) ;`,
		timeout: 40000, // 40s
		values: [
            [data.name, data.user, data.password, data.type, data.cpf, `${data.user}@agenciaboz.com.br`, data.birthday, data.role]
        ]
	}, (error, results) => {
		if (error) console.error(error);
        
        console.log(results)
        response.json(results)
        mysql.end()
	});


});

module.exports = router;