const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')

router.post('/integracao', (request, response, next) => {
    const data = request.body
    console.log(data)

    response.send('teste')
})

router.get('/keys/:loja', (request, response) => {
    const loja = request.params.loja
    const mysql = newMysql(config.sbop.database);
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

router.post('/new_keys', (request, response, next) => {
    const loja = request.body.loja

    const mysql = newMysql(config.sbop.database);
	mysql.connect();

    mysql.query({
        sql: "SELECT * FROM pix_keys WHERE loja = ?",
        values: [ loja ]
    }, (error, results) => {
        const keys = results[0]
        console.log(`searching keys for ${loja}`)
        
        if (keys) {
            console.log(keys)
            response.json({ keys, url: `https://app.agenciaboz.com.br:4000/api/v1/sbop/pagseguro/keys/${loja}` })

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

                            response.json({ keys , url: `https://app.agenciaboz.com.br:4000/api/v1/sbop/pagseguro/keys/${loja}`, new: true })
                        })
                    })
                })
            })
        }
    })
    
})

module.exports = router;