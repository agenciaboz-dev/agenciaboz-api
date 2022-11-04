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

const modificar_cupons = require('./modificar_cupons');
router.use('/modificar_cupons', modificar_cupons);

const get_history = require('./get_history');
router.use('/get_history', get_history);

module.exports = router;