const express = require('express')
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')

router.post('/', (request, response, next) => {    
   const data = request.body

   const mysql = newMysql(config.sion.database);
   mysql.connect();
   
   mysql.query({
       sql: `SELECT * FROM adms WHERE (username = ? OR email = ?) AND password = ?`,
       timeout: 40000, // 40s
       values: [
           data.user,
           data.user,
           data.password,
       ]
   }, (error, results) => {
       if (error) console.error(error);

       const adm = results[0]
       if (adm) {
        response.json({...adm, adm: true})
    
        } else {
        mysql.query({
            sql: "SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?",
            values: [
                data.user,
                data.user,
                data.password,
            ]
        }, (error, results) => {
            if (error) console.error(error)

            const user = results[0]
            if (user) {
                response.json(user)
            } else {
                response.json({error: 'not found'})
            }
        })
       }

   });
});

module.exports = router