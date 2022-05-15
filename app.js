const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors')

const accountsRoutes = require('./api/routes/accounts');
const experiencessRoutes = require('./api/routes/experiencesPro');
const formationsRoutes =  require('./api/routes/formations');
const competencesRoutes = require('./api/routes/competence');


app.use('/accounts',accountsRoutes);
app.use('/experiencespro',experiencessRoutes);
app.use('/formations', formationsRoutes);
app.use('/competences', competencesRoutes);


app.use(bodyParser.urlencoded({
 extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('./upload'));
app.all('*', function (req, res, next) {
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization ,Accept');
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Credentials', true);
 res.setHeader('Access-Control-Expose-Headers', 'Authorization');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
 next();
});

//app.use(morgan('dev'));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({extended: false}));
app.use(bodyParser.urlencoded({
 extended: true
}));
app.use(express.static(__dirname))

module.exports = app;