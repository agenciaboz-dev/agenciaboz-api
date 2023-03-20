const express = require('express');
const router = express.Router();
const config = require('../../config.json')
const newMysql = require('../../src/database')
const { execSync } = require('child_process');


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
    sql: `SELECT * FROM Membros WHERE nome ${data.name ? 'REGEXP' : 'like'} ? order by nome`,
    timeout: 40000,
    values: [data.name ? data.name.split(' ').join('|') : '%%']
   }, (error, results) => {
       if (error) console.error(error);

        const parsed_results = results?.map(member => {
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

router.post('/update/plan', (request, response) => {
    const data = request.body
    const mysql = newMysql(config.sbop.database)
    mysql.connect()

    mysql.query({
        sql: "update Membros set assinatura = ? where id = ?",
        values: [ data.plan, data.id ]
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
       sql: `SELECT * FROM Solicitacoes WHERE USUARIO = ? order by ID desc`,
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

router.post('/requests/cancel', (request, response, next) => {    
   const data = request.body

   const mysql = newMysql(config.sbop.database);
   mysql.connect();
   
   mysql.query({
       sql: `UPDATE Solicitacoes SET SITUACAO = 'Cancelado' WHERE ID = ?`,
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

router.post('/requests/new', (request, response, next) => {    
   const data = request.body
   const member = data.member

   const mysql = newMysql(config.sbop.database);
   mysql.connect();
   
   mysql.query({
       sql: `SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name = 'Solicitacoes' AND table_schema = DATABASE()`,
       timeout: 40000, // 40s
       values: [
       ]
   }, (error, results) => {
       if (error) console.error(error);

        const new_id = results[0].AUTO_INCREMENT

        const today = new Date().toLocaleDateString('pt-BR')

        const solicitacao = {
            date: today,
            protocol: `${member.id}.${data.request_id}.${new_id}.${today.split('/')[0]}.${today.split('/')[1]}.${today.split('/')[2]}`,
            user_id: member.id,
            status: 'Em andatamento'
        }

        mysql.query({
            sql: "SELECT * FROM available_requests WHERE id = ?",
            values: [data.request_id]
        }, (error, results) => {
            if (error) console.error(error)

            solicitacao.name = results[0].NOME

            // if it is a member certificate request
            if (data.request_id == 0) {
                execSync(`python3 src/sbop/certificate.py "${member.nome}" ${member.assinatura} /home/agenciaboz/dev.agenciaboz.com.br/documents/${member.id}`)
                solicitacao.status = 'Concluído'
                solicitacao.url = 'certificate.pdf'
            }

            mysql.query({
                sql: 'INSERT INTO Solicitacoes (USUARIO, SOLICITACAO, SITUACAO, DATA, PROTOCOLO, URL) VALUES (?)',
                values: [[solicitacao.user_id, solicitacao.name, solicitacao.status, solicitacao.date, solicitacao.protocol, solicitacao.url]]
            }, (error, results) => {
                if (error) console.error(error)

                response.json(solicitacao)
            })
        })

   });
});

module.exports = router;