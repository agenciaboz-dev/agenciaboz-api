const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const { exec } = require('child_process');


router.post('/', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();
	
	mysql.query({
		sql: `SELECT * FROM Membros WHERE (user = ? OR cpf = ? OR email = ?) AND senha = ?`,
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

router.post('/recover', (request, response) => {
    const data = request.body
    const mysql = newMysql(config.sbop.database)
    mysql.connect()

    mysql.query({
        sql: "SELECT * FROM Membros WHERE USER = ? OR cpf = ? OR email = ?",
        values: [ data.input, data.input, data.input ]
    }, (error, results) => {
		if (error) console.error(error);

        const member = results[0]
        
        if (member) {
            exec(`python3 src/sbop/recover_password.py ${member.user} ${member.email}`, (err, stdout, stderr) => {
                if (err || stderr) console.error(err)
                if (stderr) console.error(stderr)

                response.json(member)
            })
        } else {
            response.json({error: 'nothing found'})
        }
    })

})

module.exports = router;