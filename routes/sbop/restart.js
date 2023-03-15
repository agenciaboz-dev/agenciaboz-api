const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.get('/', (request, response, next) => {    
    exec('pm2 restart sbop', (error, stdout, stderr) => {
        console.log(stdout)
        response.send('done')
    })

});

module.exports = router;