const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const getHistorico = require('../../src/bapka/historico')

router.post('/', (request, response, next) => {
    const data = request.body
    const mysql = newMysql(config.bapka.database)
    mysql.query({
		sql: `SELECT * FROM clientes WHERE cpf = ? ;`,
		timeout: 40000, // 40s
		values: [
			data.cpf,
        ]
	}, (error, results) => {
        const cliente = results[0]
        if (cliente) {
            console.log(cliente)
            const table = `parceiro_${data.id}`
            mysql.query({
                sql: `SELECT * FROM ${table} WHERE id_cliente = ? ;`,
                timeout: 40000,
                values: cliente.id,
            }, (error, results) => {
                const cadastrado = results[0]
                if (cadastrado) {
                    cliente.cupons = cadastrado.cupons
                    mysql.query({
                        sql: `SELECT * FROM historicos WHERE id_cliente=${cliente.id} ORDER BY id DESC LIMIT 3`,
                        timeout: 40000, // 40s
                    }, (error, historicos) => {
                        if (error) console.error(error);
                        cliente.historico = getHistorico(historicos, 'cliente');
                        response.json(cliente)
                        mysql.end()
                    })
                } else {
                    response.json({error: 'Cliente não cadastro nessa loja'})
                    mysql.end()
                }
            })
        } else {
            response.json({error: 'Cliente não cadastrado.'})
            mysql.end()
        }
    })
})

module.exports = router;