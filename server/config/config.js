//Puerto
process.env.PORT = process.env.PORT || 8787;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'desarrollo';

//DB
let urlDB;

if ( process.env.NODE_ENV === 'desarrollo') {
    urlDB = 'mongodb://localhost:27017/pedidosDB';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URL_DB = urlDB;


//Fecha expiracion del token
process.env.EXP_TOKEN = '48h' ;

//Semilla del token
process.env.SEED = process.env.SEED || 'Este es un seed muy dificil';
