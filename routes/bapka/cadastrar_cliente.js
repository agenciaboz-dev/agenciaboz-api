const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')

router.post('/', (request, response, next) => {
    const data = request.body
    console.log(data);
    const mysql = newMysql(config.bapka.database)
    mysql.query({
		sql: `SELECT * FROM clientes WHERE cpf = ? ;`,
		timeout: 40000, // 40s
		values: [
			data.cliente.input_cpf,
        ]
	}, (error, results) => {
        const cliente = results[0]
        if (cliente) {
            mysql.query({
                sql: `INSERT INTO parceiro_${data.id_parceiro} (id_cliente, cupons) values (?) ;`,
                timeout: 40000,
                values: [
                    [cliente.id, 0]
                ]
            }, (error, results) => {
                if (error) console.error(error)
                response.json({success: 'Cliente cadastrado'})
            })
        } else {
            if (data.cliente.input_senha == data.cliente.input_confirmacao) {
                const cliente = data.cliente
                mysql.query({
                    sql: `SELECT * FROM clientes WHERE cpf = ? ;`,
                    timeout: 40000,
                    values: [cliente.input_cpf]
                }, (error, results) => {
                    if (error) console.error(error)
                    if (results[0]) {
                        response.json({error: 'CPF já cadastrado'})
                    } else {
                        mysql.query({
                            sql: `SELECT * FROM clientes WHERE telefone = ? ;`,
                            timeout: 40000,
                            values: [cliente.input_telefone]
                        }, (error, results) => {
                            if (error) console.error(error)
                            if (results[0]) {
                                response.json({error: 'Telefone já cadastrado'})
                            } else {
                                mysql.query({
                                    sql: `SELECT * FROM clientes WHERE email = ? ;`,
                                    timeout: 40000,
                                    values: [cliente.input_email]
                                }, (error, results) => {
                                    if (error) console.error(error)
                                    if (results[0]) {
                                        response.json({error: 'E-mail já cadastrado'})
                                    } else {
                                        mysql.query({
                                            sql: `INSERT INTO clientes (nome, cpf, telefone, senha, email) VALUES (?) ;`,
                                            timeout: 40000,
                                            values: [
                                                [cliente.input_nome, cliente.input_cpf, cliente.input_telefone, cliente.input_senha, cliente.input_email]
                                            ]
                                        }, (error, results) => {
                                            if (error) console.error(error)
                                            mysql.query({
                                                sql: `SELECT * FROM clientes WHERE cpf = ? ;`,
                                                timeout: 40000,
                                                values: [cliente.input_cpf]
                                            }, (error, results) => {
                                                if (error) console.error(error)
                                                const cliente = results[0]
                                                mysql.query({
                                                    sql: `INSERT INTO parceiro_${data.id_parceiro} (id_cliente, cupons) values (?) ;`,
                                                    timeout: 40000,
                                                    values: [
                                                        [cliente.id, 0]
                                                    ]
                                                }, (error, results) => {
                                                    if (error) console.error(error)
                                                    response.json({success: 'Cliente cadastrado'})
                                                })
                                            })
                                        })
                                    }
                                })
                            }
                        })
                    }
                })

            } else {
                response.json({error: 'Senhas não conferem'})
            }
        }
        
    })
})

module.exports = router;

