const axios = require('axios');

const api = axios.create({
    baseURL: 'https://crm.rdstation.com/api/v1/',
    timeout: 1000 * 10,
})

module.exports = api