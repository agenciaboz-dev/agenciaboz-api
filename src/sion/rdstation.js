const axios = require('axios');

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

            name: contract.name
        }
    }

    api.post('/organizations'+api.token, data)
    .then(response => callback(response.data))
    .catch(error => console.error(error))
}

api.lead = (data) => {
    api.post('/deals'+api.token, data)
    .then(response => response.data)
    .catch(error => console.error(error))
}

const organization = { fields: {
    cnpj: { id: '5ef9e1ac2a89e4000e3cece5' },
    uc: { id: '5ef5ffafd59f1f000df749ce' }
}}

module.exports = api