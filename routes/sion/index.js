const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
    response.send('oi')
})

// sub-routes
const signup = require('./signup');
router.use('/signup', signup);

const login = require('./login');
router.use('/login', login);

const contract = require('./contract');
router.use('/contract', contract);


module.exports = router;