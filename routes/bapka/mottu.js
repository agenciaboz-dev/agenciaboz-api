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

router.get('/pagseguro', (request, response, next) => {
    
    response.json({
        public_key: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvUkVN2qhJCWsxxkPmmnq
            EX3fAB1+2nTZkr7VLTUnrBLJstWweuU1hpCQ2P3BoZwxgUMKnhHhDEbLelFv8wCc
            Rv31mkHkF1gFPtk++tV6K8ElsGsExCDVXoPQkg2JkYSmdhYgPoPUBhtqlO5Yv1yz
            xteIYpDToaqiO/SoMCzzw75MZpxGe/xkiya20S8apXL5bLsbAwryr4Xy17HqMwze
            /dl1AIbwrQ4wCJTgq/Iieo5auamk9jpHPXLtdFGUr8910LFT8PaPcfZyGTWiJtls
            1HcqETqncunXtUNcZBGPS666RVkqrXej1gTTC9wObRV2/GbrBa+JDxM2/Rt+06Hj
            yQIDAQAB`, 
        created_at: 1671455460
    })
})

module.exports = router;