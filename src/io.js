const { io } = require("socket.io-client").io("wss://app.agenciaboz.com.br:4101")

module.exports = io
