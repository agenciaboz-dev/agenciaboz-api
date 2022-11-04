const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const getHistorico = require('../../src/bapka/historico')

router.post('/', (request, response, next) => {
    const data = request.body
    const mysql = newMysql(config.bapka.database)
    
    mysql.query({
        sql: `SELECT * FROM historicos WHERE id_${data.user_type}=${data.id} ORDER BY id DESC LIMIT 3`,
        timeout: 40000, // 40s
    }, (error, historicos) => {
        if (error) console.error(error);
        
        response.json({
            historico: getHistorico(historicos, data.user_type == 'cliente' ? 'parceiro' : 'cliente'),
        })
    })
})

module.exports = router;