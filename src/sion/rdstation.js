const axios = require('axios');

const api = axios.create({
    baseURL: 'https://crm.rdstation.com/api/v1',
    timeout: 1000 * 10,
})

const token = '?token=6422e7534495ab000b1b42cd'

api.token = token

api.lead = (data) => {
    api.post('/deals'+rdstation.token, data)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    .catch(error => console.error(error))
}

module.exports = api