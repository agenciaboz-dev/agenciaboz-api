const axios = require('axios');

const api = axios.create({
    baseURL: 'https://viacep.com.br/ws',
    timeout: 1000 * 10,
})

api.search = (cep, callback) => {

    api.get(`/${cep}/json/`)
    .then(response => callback(response.data))
    .catch(error => console.error(error))
}


module.exports = api