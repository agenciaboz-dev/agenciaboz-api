const { WebSocketServer } = require('ws');

const clients = require('../src/wsClients')

const wsServer = new WebSocketServer({ noServer: true })

wsServer.on('connection', (connection) => {
    // Generate a unique code for every user
    connection.on('message', message => {
        clients[message.toString()] = connection
    })

});

module.exports = { wsServer }