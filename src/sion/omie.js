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
                nome_fantasia: contract.name
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

const KEY = '2937495729168'
const SECRET = 'd8bc84dfc0e30d30a188f70a5ddf5550'

module.exports = api