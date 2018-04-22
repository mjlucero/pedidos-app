var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../modelo/usuario');


app.post('/login', (req,res)=>{
    var body = req.body;

    Usuario.findOne( { email:body.email }, ( err,usuario )=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuario',
                errores: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok:false,
                mensaje: 'Credenciales incorrectas',
                errores: { message: 'Correo incorrecto' }
            });
        }

        if ( !bcrypt.compareSync( body.password, usuario.password) ) {
            return res.status(400).json({
                ok:false,
                mensaje: 'Credenciales incorrectas',
                errores: { message: 'Password incorrecto' }
            });
        }


        //Crear token
        var token = jwt.sign( { usuario }, process.env.SEED = process.env.SEED , { expiresIn: process.env.EXP_TOKEN } );


        res.status(200).json({
            ok:true,
            usuario,
            token
        });
    });
})


module.exports = app;