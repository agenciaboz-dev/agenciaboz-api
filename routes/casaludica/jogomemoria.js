const express = require('express');
const router = express.Router();

let rooms = [];
let players = [];

router.get('/', (request, response, next) => {    
	const data = request.body;

    response.json('oi');



});

router.get('/rooms', (request, response, next) => {    
    
    response.json(rooms);
    
});

router.get('/new_room', (request, response, next) => {
    const player = {
        id: players.length,
    }
    const room = {
        id: rooms.length,
        
    }
    
    players.push(player)
    rooms.push(room);
    response.json({room, player});

});

module.exports = router;