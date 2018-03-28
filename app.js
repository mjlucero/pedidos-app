var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();



//Importaciones de Rutas
var appRoutes = require('./rutas/app');
var usuarioRoutes = require('./rutas/usuario');

mongoose.connection.openUri('mongodb://localhost:27017/pedidosDB', (err, res)=>{
    if (err) throw err;

    console.log('Base de datos online');
});


//Middlewares
//Body Parser
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());
//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);



app.listen(8787,()=>{
    console.log('Express server puerto 8787 online');
});
