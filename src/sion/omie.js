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
                codigo_cliente_integracao: contract.id.toString(),
                email: contract.email,
                razao_social: contract.company || contract.name,
                nome_fantasia: contract.name
            }
        ]
    }
    api.post('/geral/clientes/', data)
    .then(response => console.log(response.data))
    .catch(error => console.error(error))
}

const KEY = '38333295000'
const SECRET = 'fed2163e2e8dccb53ff914ce9e2f1258'

module.exports = api