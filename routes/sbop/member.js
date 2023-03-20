const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')


router.post('/', (request, response, next) => {    
	const data = request.body;

	const mysql = newMysql(config.sbop.database);
	mysql.connect();
	
	mysql.query({
		sql: `SELECT * FROM Membros WHERE id = ? ;`,
		timeout: 40000, // 40s
		values: [ data.id ]
	}, (error, results) => {
		if (error) console.error(error);
		const member = results[0]
        console.log(member)

        member.pago = Boolean(+member.pago)
        if (member.temporario == "True") {
            member.temporario = 1
        }
        if (member.temporario == "False") {
            member.temporario = 0
        }
        if (member.primeiro_acesso == "True") {
            member.primeiro_acesso = 1
        }
        if (member.primeiro_acesso == "False") {
            member.primeiro_acesso = 0
        }
        member.temporario = Boolean(+member.temporario)
        member.primeiro_acesso = Boolean(+member.primeiro_acesso)
        member.especialidades = member.especialidades.split(',')

        response.json(member)
		mysql.end();
	});


});

router.post('/search', (request, response, next) => {    
   const data = request.body

   const mysql = newMysql(config.sbop.database);
   mysql.connect();

   
   mysql.query({
    sql: `SELECT * FROM Membros WHERE nome ${data.name ? 'REGEXP' : 'like'} ?`,
    timeout: 40000,
    values: [data.name ? data.name.split(' ').join('|') : '%%']
   }, (error, results) => {
       if (error) console.error(error);

        const parsed_results = results.map(member => {
            member.pago = Boolean(+member.pago)
            if (member.temporario == "True") {
                member.temporario = 1
            }
            if (member.temporario == "False") {
                member.temporario = 0
            }
            if (member.primeiro_acesso == "True") {
                member.primeiro_acesso = 1
            }
            if (member.primeiro_acesso == "False") {
                member.primeiro_acesso = 0
            }
            member.temporario = Boolean(+member.temporario)
            member.primeiro_acesso = Boolean(+member.primeiro_acesso)
            member.especialidades = member.especialidades.split(',')

            return member
        })

        console.log(parsed_results)
        response.json(parsed_results)

       mysql.end();
   });
});

router.post('/update', (request, response) => {
    const data = request.body
    const mysql = newMysql(config.sbop.database)
    mysql.connect()

    mysql.query({
        sql: "update Membros set bairro = ?, celular = ?, cep = ?, cidade = ?, complemento = ?, cpf = ?, crm = ?, curriculum = ?, email = ?, endereco = ?, need_location = true, nome = ?, numero = ?, pago = ?, pessoa = ?, primeiro_acesso = ?, senha = ?, telefone = ?, temporario = ?, uf = ?, user = ?, especialidades = ? where id = ?",
        values: [ 
            data.bairro,
            data.celular,
            data.cep,
            data.cidade,
            data.complemento,
            data.cpf,
            `${data.crm.split('-')[0]}-${data.crm_uf}`,
            data.curriculum,
            data.email, 
            data.endereco,
            data.nome,
            data.numero,
            data.pago,
            data.pessoa,
            data.primeiro_acesso,
            data.senha,
            data.telefone,
            data.temporario,
            data.uf,
            data.user,
            data.especialidades.toString(),
            data.id,
        ]
    }, (error, results) => {
        if (error) console.error(error)
        response.json(results)
    })
})

router.post('/update/email', (request, response) => {
    const data = request.body
    const mysql = newMysql(config.sbop.database)
    mysql.connect()

    mysql.query({
        sql: "update Membros set email = ? where id = ?",
        values: [ data.email, data.id ]
    }, (error, results) => {
        if (error) console.error(error)
        response.json(results)
    })
})

router.post('/update/password', (request, response) => {
    const data = request.body
    const mysql = newMysql(config.sbop.database)
    mysql.connect()

    mysql.query({
        sql: "update Membros set senha = ?, primeiro_acesso = false where id = ?",
        values: [ data.password, data.id ]
    }, (error, results) => {
        if (error) console.error(error)
        response.json(results)
    })
})

router.post('/update/temporario', (request, response) => {
    const data = request.body
    const mysql = newMysql(config.sbop.database)
    mysql.connect()

    mysql.query({
        sql: "update Membros set temporario = 'False' where id = ?",
        values: [ data.id ]
    }, (error, results) => {
        if (error) console.error(error)
        response.json(results)
    })
})

router.post('/requests', (request, response, next) => {    
   const data = request.body

   const mysql = newMysql(config.sbop.database);
   mysql.connect();
   
   mysql.query({
       sql: `SELECT * FROM Solicitacoes WHERE USUARIO = ?`,
       timeout: 40000, // 40s
       values: [
           data.id,
       ]
   }, (error, results) => {
       if (error) console.error(error);

       response.json(results)

       mysql.end();
   });
});

module.exports = router;