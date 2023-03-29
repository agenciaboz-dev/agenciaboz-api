var express = require('express');
const fileUpload = require('express-fileupload')
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(fileUpload())

// CORS
const cors = require('cors');
app.use(cors());

// serve static files
app.use('/documents', express.static('documents'));

// ROUTES
const agenciaboz = require('./routes/app');
app.use('/api/v1/app', agenciaboz);

const sbop = require('./routes/sbop');
app.use('/api/v1/sbop', sbop);

const casaludica = require('./routes/casaludica');
app.use('/api/v1/casaludica', casaludica);

const bapka = require('./routes/bapka')
app.use('/api/v1/bapka', bapka)

const sion = require('./routes/sion')
app.use('/api/v1/sion', sion)

module.exports = app;
