const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
    response.send('oi')
})

// sub-routes
const signup = require('./signup');
router.use('/signup', signup);


module.exports = router;