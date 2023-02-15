const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


/* GET users listing. */
router.post('/', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.sion.database);
	mysql.connect();

    if (data.news_signup) {

        mysql.query({
            sql: "INSERT INTO emails (email) VALUES (?)",
            values: [
                data.email,
            ]
        }, (error, results) => {
            if (error) console.error(error);
    
            response.json(results)
            mysql.end()
        })
    }
	
        
});

module.exports = router;