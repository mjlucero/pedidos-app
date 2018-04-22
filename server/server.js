require('./config/config');

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();

//Middlewares

//Body Parser
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());


//Importaciones de Rutas
app.use( require('./rutas/index') );

mongoose.connection.openUri( process.env.URL_DB , (err, res)=>{
    if (err) throw err;

    console.log('Base de datos online');
});

app.listen( process.env.PORT ,()=>{
    console.log(`Express server puerto ${ process.env.PORT } online`);
});
