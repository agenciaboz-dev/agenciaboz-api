const axios = require('axios');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const api = axios.create({
    baseURL: 'https://crm.rdstation.com/api/v1',
    timeout: 1000 * 10,
})

const token = '?token=6422e7534495ab000b1b42cd'

api.token = token

api.organization = (contract, callback) => {
    const data = {
        organization: {
            organization_custom_fields: [
                {
                    custom_field_id: organization.fields.cnpj.id,
                    value: contract.cnpj
                },
            ],
            organization_segments: [contract.category],
            name: contract.company || contract.name
        }
    }

    api.post('/organizations'+api.token, data)
    .then(response => callback(response.data))
    .catch(error => console.error(error))
}

api.lead = (data) => {
    api.post('/deals'+api.token, data)
    .then(async (response) => {
        const lead = await prisma.rdstation.create({ data: { id: response.data._id, contract_id: data.id, state: 1 } })
        console.log(lead)
    })
    .catch(error => console.error(error))
}

api.sign = async (data) => {
    const oportunity = await prisma.rdstation.findUnique({ where: { contract_id: data.id } })
    
    api.put('/deals/'+oportunity.id+api.token, { deal_stage_id: stages.assinatura })
    .then(response => prisma.rdstation.update({ where: { id: oportunity.id }, data: { state: 2 } }))
    .catch(error => console.error(error))
}

api.closed = async (data) => {
    const oportunity = await prisma.rdstation.findUnique({ where: { contract_id: data.id } })

    api.put('/deals/'+oportunity.id+api.token, { deal_stage_id: stages.fechado })
    .then(response => prisma.rdstation.update({ where: { id: oportunity.id }, data: { state: 3 } }))
    .catch(error => console.error(error))
}

const organization = { fields: {
    cnpj: { id: '5ef9e1ac2a89e4000e3cece5' },
    uc: { id: '5ef5ffafd59f1f000df749ce' }
}}

const stages = {
    lead: '603392f33553ba0017383e14',
    assinatura: '606e324d9d4e04000a159e8b',
    fechado: '63ef72136c863d0017aded1a'
}

module.exports = api