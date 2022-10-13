const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
    response.send('oi')
})

// sub-routes
const login = require('./jogomemoria');
router.use('/jogomemoria', jogomemoria);

module.exports = router;