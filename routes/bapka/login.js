const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const getHistorico = require('../../src/bapka/historico')
const getLojas = require('../../src/bapka/get_lojas')


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

        if (!!results[0]) {
            // get historico
            mysql.query({
                sql: `SELECT * FROM historicos WHERE id_${data.type}=${results[0].id} ORDER BY id DESC LIMIT 3`,
                timeout: 40000, // 40s
            }, (error, historicos) => {
                if (error) console.error(error);
                results[0].historico = getHistorico(historicos, data.type == 'cliente' ? 'parceiro' : 'cliente');
                console.log(results);
                response.json(results[0]);
            })
        } else {
            response.json({error: 'Usuário não encontrado'})
        }
		mysql.end();
	});


});

module.exports = router;