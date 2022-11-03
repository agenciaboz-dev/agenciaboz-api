const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
    response.send('oi')
})

// sub-routes
const login = require('./login');
router.use('/login', login);

const search_cpf = require('./search_cpf');
router.use('/search_cpf', search_cpf);

module.exports = router;