var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

// CORS
const cors = require('cors');
app.use(cors());

// ROUTES

const sbop = require('./routes/sbop');
app.use('/api/v1/sbop', sbop);

const casaludica = require('./routes/casaludica');
app.use('/api/v1/casaludica', casaludica);

module.exports = app;
