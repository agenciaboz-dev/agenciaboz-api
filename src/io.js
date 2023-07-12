const { io } = require("socket.io-client")

const socket = io("wss://app.agenciaboz.com.br:4101")

module.exports = socket
