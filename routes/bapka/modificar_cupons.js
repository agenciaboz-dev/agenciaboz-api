const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const getHistorico = require('../../src/bapka/historico')
const setCupons = require('../../src/bapka/cupons')
const dateTime = require('node-datetime')

router.post('/', (request, response, next) => {
    const data = request.body
    const mysql = newMysql(config.bapka.database)

    const setHistorico = () => {
        console.log(data)
        const datetime = dateTime.create()
        const formatted = datetime.format('d/m/Y H:M')
        const [date, time] = formatted.split(' ')
    
        mysql.query({
            sql: `INSERT INTO historicos (id_parceiro, nome_parceiro, id_cliente, nome_cliente, data, hora, quantidade) VALUES (?)`,
            timeout: 40000, // 40s
            values: [
                [data.id_parceiro, data.nome_parceiro, data.id_cliente, data.nome_cliente, date, time, data.quantidade],
    
            ]
        }, (error, results) => {
            if (error) console.error(error)
            mysql.query({
                sql: `SELECT * FROM historicos WHERE id_cliente=${data.id_cliente} ORDER BY id DESC LIMIT 3`,
                timeout: 40000, // 40s
            }, (error, historicos) => {
                if (error) console.error(error);
                
                response.json({
                    historico: getHistorico(historicos, 'parceiro'),
                    cupons: data.total,
                })
            })
        })
    }

    
    setCupons(data, mysql, setHistorico)
})

module.exports = router;