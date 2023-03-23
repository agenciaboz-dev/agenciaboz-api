var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const multer = require('multer');

var app = express();

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'documents/'); // Set the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); // Set a unique filename for the uploaded file
    },
});

const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

// CORS
const cors = require('cors');
app.use(cors());

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
