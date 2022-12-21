const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const axios = require('axios');
const newMysql = require('../../src/database');
const { exec } = require('child_process');
const fs = require('fs')

router.post('/pedido', (request, response, next) => {    
    const address = request.body.address;
    const loja = request.body.loja
    console.log(loja)

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
    
                // console.log(_response.data)
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
                    sql: "UPDATE mottu_token set token = ?, expiration = ? WHERE loja = ?",
                    values: [
                        response.data.token, 
                        date,
                        loja
                    ]
                }, (error, results) => {
                    if (error) console.error(error)
        
                    token = response.data.token
                    console.log(token)
                    // newOrder(token)
                })
            })
            .catch((error) => {
                console.error(error)
            })

        } else {
            token = result.token
            console.log(token)
            // newOrder(token)
        }
    })
    
});

router.post('/integracao', (request, response, next) => {
    const data = request.body
    console.log(data)

    response.send('teste')
})

router.get('/pagseguro/keys/:loja', (request, response) => {
    const loja = request.params.loja
    const mysql = newMysql(config.bapka.database);
	mysql.connect();

    mysql.query({
        sql: "SELECT * FROM pix_keys WHERE loja = ?",
        values: [ loja ]
    }, (error, results) => {
        const keys = results[0]
        console.log(`searching keys for ${loja}`)
        
        if (keys) {
            const key = {
                public_key: keys.public,
                created_at: keys.timestamp
            }

            response.json(key)
        }
    })
});

router.post('/pagseguro/new_keys', (request, response, next) => {
    const loja = request.body.loja

    const mysql = newMysql(config.bapka.database);
	mysql.connect();

    mysql.query({
        sql: "SELECT * FROM pix_keys WHERE loja = ?",
        values: [ loja ]
    }, (error, results) => {
        const keys = results[0]
        console.log(`searching keys for ${loja}`)
        
        if (keys) {
            console.log(keys)
            response.json({ keys, url: `https://app.agenciaboz.com.br:4000/api/v1/bapka/mottu/pagseguro/keys/${loja}` })

        } else {
            console.log('keys not found, generating new rsa key')
            const command = {
                private: `openssl genpkey -algorithm RSA -out private-key -pkeyopt rsa_keygen_bits:2048`,
                public: `openssl rsa -pubout -in private-key -out public-key`
            }

            const keys = {}

            exec(command.private, (err, stdout, stderr) => {
                console.log('private key:')
                exec('cat private-key', (err, stdout, stderr) => {
                    console.log('success')
                    keys.private = stdout.replaceAll(`\r\n`, '')
                    
                    exec(command.public, (err, stdout, stderr) => {
                        console.log('public key:')
                        exec('cat public-key', (err, stdout, stderr) => {
                            console.log('success')
                            keys.public = stdout.replaceAll(`\r\n`, '')

                            mysql.query({
                                sql: "INSERT INTO pix_keys (loja, private, public, timestamp) VALUES (?)",
                                values: [[ loja, keys.private, keys.public, Date.now() ]]
                            }, (error, results) => {
                                console.log('keys stored in database')
                            })

                            response.json({ keys , url: `https://app.agenciaboz.com.br:4000/api/v1/bapka/mottu/pagseguro/keys/${loja}`})
                        })
                    })
                })
            })
        }
    })
    
})

router.get('/pagseguro', (request, response, next) => {
    
    response.json({
        public_key: `-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvUkVN2qhJCWsxxkPmmnqEX3fAB1+2nTZkr7VLTUnrBLJstWweuU1hpCQ2P3BoZwxgUMKnhHhDEbLelFv8wCcRv31mkHkF1gFPtk++tV6K8ElsGsExCDVXoPQkg2JkYSmdhYgPoPUBhtqlO5Yv1yzxteIYpDToaqiO/SoMCzzw75MZpxGe/xkiya20S8apXL5bLsbAwryr4Xy17HqMwze/dl1AIbwrQ4wCJTgq/Iieo5auamk9jpHPXLtdFGUr8910LFT8PaPcfZyGTWiJtls1HcqETqncunXtUNcZBGPS666RVkqrXej1gTTC9wObRV2/GbrBa+JDxM2/Rt+06HjyQIDAQAB-----END PUBLIC KEY-----`, 
        created_at: 1671455460
    })
})

module.exports = router;