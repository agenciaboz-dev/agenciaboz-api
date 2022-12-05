const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
    response.send('oi')
})

// sub-routes
const login = require('./login');
router.use('/login', login);

const delete_member = require('./delete_member');
router.use('/delete_member', delete_member);

module.exports = router;