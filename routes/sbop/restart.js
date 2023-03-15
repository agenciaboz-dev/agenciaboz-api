const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const need_restart = '../../src/sbop/need_restart.js'

router.get('/', (request, response, next) => {    
    exec('pm2 restart sbop', (error, stdout, stderr) => {
        console.log(stdout)
        response.send('done')
    })

});

router.get('/need_restart', (request, response) => {
    response.json(need_restart)
})

module.exports = router;