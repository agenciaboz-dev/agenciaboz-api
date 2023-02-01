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

    const sql = `SELECT * FROM tasks WHERE ${data.review ? "planner" : "worker"} = ? ${data.important ? "AND priority = 2" : ""} ${data.today ? `AND DATE(date) = CURDATE()` : ""} ORDER BY customer DESC, done ${data.review ? "DESC" : ""}, priority DESC, date`

    mysql.query({
        sql: sql,
        timeout: 40000, // 40s
        values: [
            data.user
        ]
    }, (error, results) => {
        if (error) console.error(error);

        if (results.length == 0) {
            response.json({empty: true})
            
        } else {
            response.json(results);
            console.log(results)
        }

        mysql.end()
    });


});

router.post('/done', (request, response) => {
    const task = request.body
    const mysql = newMysql(config.app.database)
    mysql.connect()
    mysql.query({
        sql: `UPDATE tasks SET done = ? WHERE id = ?`,
        values: [ task.done, task.id ]
    }, (error, results) => {
        if (error) console.error(error)

        response.json(results)
        mysql.end()

    })
})

router.post('/finished', (request, response) => {
    const task = request.body
    const mysql = newMysql(config.app.database)
    mysql.connect()
    mysql.query({
        sql: `UPDATE tasks SET finished = ? WHERE id = ?`,
        values: [ task.finished, task.id ]
    }, (error, results) => {
        if (error) console.error(error)

        response.json(results)
        mysql.end()

    })
})

router.post('/delete', (request, response) => {
    const task = request.body
    const mysql = newMysql(config.app.database)
    mysql.connect()
    mysql.query({
        sql: `DELETE FROM tasks WHERE id = ?`,
        values: [ task.id ]
    }, (error, results) => {
        if (error) console.error(error)

        response.json(results)
        mysql.end()

    })
})

module.exports = router;