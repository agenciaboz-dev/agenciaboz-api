const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const getHistorico = require('../../src/bapka/historico')
// const getLojas = require('../../src/bapka/get_lojas')


router.post('/', (request, response, next) => {    
	const data = request.body;
	const mysql = newMysql(config.bapka.database);
    
	mysql.connect();

    const table = data.type == 'cliente' ? 'clientes' : 'parceiros';
    const user_column = data.type == 'cliente' ? 'telefone' : 'email';

	
	mysql.query({
		sql: `SELECT * FROM ${table} WHERE ${user_column} = ? AND senha = ? ;`,
		timeout: 40000, // 40s
		values: [
			data[`user_${data.type}`],
			data[`password_${data.type}`],
        ]
	}, (error, results) => {
		if (error) console.error(error);
        const usuario = results[0]

        if (!!usuario) {
            // get historico
            mysql.query({
                sql: `SELECT * FROM historicos WHERE id_${data.type}=${usuario.id} ORDER BY id DESC LIMIT 3`,
                timeout: 40000, // 40s
            }, (error, historicos) => {
                if (error) console.error(error);
                usuario.historico = getHistorico(historicos, data.type == 'cliente' ? 'parceiro' : 'cliente');
                // console.log(results);
                // GETTING LOJAS
                if (data.type == 'cliente') {
                    usuario.lojas = []
                    mysql.query({
                        sql: `SELECT COUNT(*) FROM parceiros`,
                        timeout: 40000, // 40s
                    }, (error, results) => {
                        if (error) console.error(error);
                        const count = results[0]['COUNT(*)']
                        for (let i = 0; i < count; i++) {
                            mysql.query({
                                sql: `SELECT * FROM parceiro_${i} WHERE id_cliente = ${usuario.id}`,
                                timeout: 40000
                            }, (error, results) => {
                                if (error) console.error(error);
                                const loja = results[0]
                                if (loja) {
                                    usuario.lojas.push(loja)
                                }
                                if (i == count-1) {
                                    response.json(usuario);
                                    console.log(usuario);
                                    mysql.end();
                                }
                            })
                        }
                    })
                } else {
                    response.json(usuario);
                    mysql.end();
                }
            })
        } else {
            response.json({error: 'Usuário não encontrado'})
            mysql.end();
        }
	});


});

module.exports = router;