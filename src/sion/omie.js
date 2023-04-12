const axios = require('axios');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const api = axios.create({
    baseURL: 'https://app.omie.com.br/api/v1',
    timeout: 1000 * 10,
})

api.signup = ( contract ) => {
    const data = {
        call: "IncluirCliente",
        app_key: KEY,
        app_secret: SECRET,
        param: [
            {
                cnpj_cpf: contract.cnpj || contract.cpf,
                codigo_cliente_integracao: 's'+contract.id.toString(),
                email: contract.email,
                razao_social: contract.company || contract.name,
                nome_fantasia: contract.name,
                pessoa_fisica: !contract.cnpj && "S",
                cep: contract.cep,
                endereco: contract.address,
                endereco_numero: contract.number,
                bairro: contract.district,
                estado: contract.state,
                cidade: contract.city,

            }
        ]
    }
    api.post('/geral/clientes/', data)
    .then(async (response) => {
        const id = response.data.codigo_cliente_omie.toString()
        console.log({omie_id: id})
        const omie = await prisma.omie.create({ data: { id, contract_id: contract.id } })
        console.log({omie})
    })
    .catch(error => console.error(error))
}

api.bill = async ( contract ) => {
    console.warning('O CEP TEM QUE SER VÁLIDO')
    const omie = await prisma.omie.findFirst({ where: { contract_id: contract.id } })
    const data = {
        call: "IncluirContaReceber",
        app_key: KEY,
        app_secret: SECRET,
        param: [
          {
            codigo_lancamento_integracao: "s"+contract.id.toString(),
            codigo_cliente_fornecedor: omie.id,
            data_vencimento: new Date().toLocaleDateString('pt-BR'),
            valor_documento: 100,
            codigo_categoria: "1.01.02",
            data_previsao: new Date().toLocaleDateString('pt-BR'),
            id_conta_corrente: CONTACORRENTE
          }
        ]
    }

    api.post('/financas/contareceber/', data)
    .then(async (response) => {
        const bill_id = response.data.codigo_lancamento_omie
        await prisma.omie.update({ where: { id: omie.id }, data: { bill: bill_id } })
        console.log({bill_id})
        const data = {
            call: "GerarBoleto",
            app_key: KEY,
            app_secret: SECRET,
            param: [
              {
                nCodTitulo: bill_id,
                cCodIntTitulo: ""
              }
            ]
        }
        api.post('/financas/contareceberboleto/', data)
        .then(response => console.log(response.data))
        .catch(error => console.error(error))
    })
    .catch(error => console.error(error))
    
}

const KEY = '2937495729168'
const SECRET = 'd8bc84dfc0e30d30a188f70a5ddf5550'
const CONTACORRENTE = 5802920977

module.exports = api