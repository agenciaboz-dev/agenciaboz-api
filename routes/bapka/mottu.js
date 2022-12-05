const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const axios = require('axios');
const newMysql = require('../../src/database');



router.post('/pedido', (request, response, next) => {    
    const address = request.body.address;

    const mysql = newMysql(config.bapka.database);
	mysql.connect();

    let token = ''

    const newOrder = (token) => {
        const mottu = axios.create({
            baseURL: 'https://hm-backendentregas.mottu.dev/api/integracoes',
            timeout: 1000 * 10,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept-Encoding': 'identity',
            }
        })

        const data = {
            "codigoConfirmacaoColeta": null,
            "codigoExterno": address.id,
    
            //"usuarioOrigemId": 15468,//Esse é o id retornado no método de login, caso não informado irá criar com o usuário do token, 
            "minutosTempoDePreparo": null,
            "ordenarMelhorRota": true,
            "pedidoEntrega": [
                {
                "endereco": {
                    "bairro": address.bairro,
                    "cep": address.cep,
                    "cidade": address.cidade,
                    "complemento": address.complemento,
                    "estado": address.estado,
                    "numero": address.numero,
                    "rua": address.rua
                    },
                "idExterno": address.id,
                "nome": address.nome,
                "observacao": "",
                "pagamentoOnline": true,
                "telefone": address.telefone
                }
            ]
        }
    
        mottu.post('/pedido/preview', data)
            .then((_response) => {
                if (_response.data.error) console.error(_response.data.error)
    
                console.log(_response.data)
                response.json(_response.data)
            })
            .catch((error) => {
                console.error(error)
            })
    
    }

    mysql.query({
        sql: "SELECT * FROM mottu_token order by id desc limit 1"
    }, (error, results) => {
        if (error) console.error(error)

        const result = results[0]

        if (result.expiration <= new Date) {

            const login = {
                "email": "bapka@agenciazop.com.br",
                "senha": "SucessoZOP2022!"
                }
        
            const date = new Date
            date.setDate(date.getDate() + 7)

            const mottu = axios.create({
                baseURL: 'https://hm-backendentregas.mottu.dev/api/integracoes',
                timeout: 1000 * 10,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'identity',
                }
            })
        
            mottu.post('/login', login)
            .then((response) => {
                if (response.data.error) console.error(response.data.error)
                
                mysql.query({
                    sql: "INSERT INTO mottu_token (token, expiration) values (?)",
                    values: [
                        [response.data.token, date]
                    ]
                }, (error, results) => {
                    if (error) console.error(error)
        
                    token = response.data.token
                    newOrder(token)
                })
            })
            .catch((error) => {
                console.error(error)
            })

        } else {
            token = result.token
            newOrder(token)
        }
    })
    
    

    console.log(token)

	

});

router.post('/integracao', (request, response, next) => {
    const data = request.body
    console.log(data)

    response.send('teste')
})

module.exports = router;