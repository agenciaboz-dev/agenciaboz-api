const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


/* GET users listing. */
router.post('/', (request, response, next) => {
    const data = request.body;
    console.log(data)

    const mysql = newMysql(config.app.database);
    mysql.connect();

    mysql.query({
        sql: `SELECT * FROM tasks WHERE worker = ?`,
        timeout: 40000, // 40s
        values: [
            data.user
        ]
    }, (error, results) => {
        if (error) console.error(error);

        response.json(results);
        // mysql.end();
    });


});

module.exports = router;