const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const axios = require('axios');
const newMysql = require('../../src/database');
const { exec } = require('child_process');
const clients = require('../../src/wsClients')

router.post('/webhook', (request, response, next) => {
    const data = request.body

    if (data?.charges[0]?.status == 'PAID') {
        const id = data.charges[0].reference_id
        const assinatura = data.items[0].name
        assinatura = assinatura.charAt(0).toUpperCase() + assinatura.slice(1)

        console.log(`pago membro ${id}`)
        
        const mysql = newMysql(config.sbop.database)
        mysql.connect()

        mysql.query({
            sql: "UPDATE Membros SET pago=true, assinatura = ? WHERE id = ?",
            values: [ assinatura, id ]
        }, (error, results) => {
            if (error) console.log(error)
        })

        clients[id].send('PAID')
        
    }

    response.json({message: 'teste'})
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

router.post('/member', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();
	
	mysql.query({
		sql: `SELECT * FROM Membros WHERE id = ? ;`,
		timeout: 40000, // 40s
		values: [ data.id ]
	}, (error, results) => {
		if (error) console.error(error);
		response.json(results);
		mysql.end();
	});


});

router.post('/new_order', (request, response, next) => {
    const data = request.body
    // console.log(data)

    const options = {
        method: 'POST',
        url: 'https://api.pagseguro.com/orders',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer ac4751ea-4d2b-4f32-9ae2-cf6b2f4da772bf4af43b43c6b2834627b037ec82c9a93900-8c98-4e5f-b786-e34a98d3b18e',
            'content-type': 'application/json'
        },

        data: data
    }

    axios.request(options)
    .then((_response) => {
        // console.log(_response.data);
        response.json(_response.data)
    })
    // .catch(function (error) {
    //     console.error(error);
    // });
        
})

router.post('/simulate_payment', (request, response, next) => {
    const options = request.body
    // console.log(data)

    axios.request(options).then(function (_response) {
        response.json(_response.data)
    }).catch(function (error) {
        console.error(error);
      });
        
})

router.post('/consult', (request, response, next) => {
    const options = request.body
    // console.log(data)

    axios.request(options).then(function (_response) {
        response.json(_response.data)
    }).catch(function (error) {
        console.error(error);
      });
        
})

router.post('/refund', (request, response, next) => {
    const options = request.body
    // console.log(data)

    axios.request(options).then(function (_response) {
        response.json(_response.data)
    }).catch(function (error) {
        console.error(error);
      });
        
})

module.exports = router;