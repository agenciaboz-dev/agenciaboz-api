const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
    response.send('<h1>oi</h1>')
})

// sub-routes
const login = require('./login');
router.use('/login', login);

const usuarios = require('./usuarios');
router.use('/usuarios', usuarios);

const cadastrar = require('./cadastrar');
router.use('/cadastrar', cadastrar);

module.exports = router;