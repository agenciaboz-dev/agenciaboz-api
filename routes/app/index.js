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

const tasks = require('./tasks');
router.use('/tasks', tasks);

const customers = require('./customers');
router.use('/customers', customers);

const new_task = require('./new_task');
router.use('/new_task', new_task);

module.exports = router;