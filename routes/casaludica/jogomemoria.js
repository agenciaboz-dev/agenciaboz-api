const express = require('express');
const router = express.Router();

let rooms = [];

router.get('/', (request, response, next) => {    
	const data = request.body;

    response.json('oi');



});

router.get('/rooms', (request, response, next) => {    
    
    response.json(rooms);

});

router.get('/new_room', (request, response, next) => {
    const room = {
        id: rooms.length,
    
    }

    rooms.push(room);
    response.json(room);

});

module.exports = router;