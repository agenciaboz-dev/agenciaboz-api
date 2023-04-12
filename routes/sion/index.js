const express = require('express');
const router = express.Router();
const viacep = require('../../src/viacep')

router.get('/', (request, response) => {
    response.send('oi')
})

router.post('/cep', (request, response, next) => {    
    const data = request.body

    viacep.search(data.cep.replace(/\D/g, ''), (address) => {
        response.json(address)
    })

})

// sub-routes
const signup = require('./signup');
router.use('/signup', signup);

const login = require('./login');
router.use('/login', login);

const contract = require('./contract');
router.use('/contract', contract);


module.exports = router;