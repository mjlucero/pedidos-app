var express = require('express');
var app = express();
var Rubro = require('../modelo/rubro');

app.get('/', (req,res,next) => {
   Rubro.find({}, ( err,rubros )=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando rubros',
                errores: err
            });
        }

        res.status(200).json({
            ok: true,
            rubros 
        });
   });
});


app.post('/', (req, res, next)=>{
    var rubro = new Rubro();

    Object.keys(req.body).forEach(key => {
        rubro[key] = req.body[key];
    });

    rubro.save(( err,rubroStored )=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear rubro',
                errores: err
            });
        }

        res.status(201).json({
            ok: true,
            rubro: rubroStored 
        });
    });
});

module.exports = app;