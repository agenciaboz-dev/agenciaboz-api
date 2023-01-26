const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


/* GET users listing. */
router.post('/', (request, response, next) => {
    const data = request.body;

    const mysql = newMysql(config.app.database);
    mysql.connect();

    mysql.query({
        sql: `SELECT * FROM users WHERE user = ? AND password = ? ;`,
        timeout: 40000, // 40s
        values: [
            data.user,
            data.password
        ]
    }, (error, results) => {
        if (error) console.error(error);
        const user = results[0]

        if (user) {
            mysql.query({
                sql: `SELECT * FROM customers ;`
            }, (error, results) => {
                const customers = results

                mysql.query({
                    sql: `SELECT * FROM users ;`
                }, (error, results) => {
                    const team = results
                    response.json({user, customers, team})
                    mysql.end();
                })
            })
        } else {
            response.json({ error: "Usuário ou senha inválidos" })
            mysql.end()
        }
    });


});

module.exports = router;