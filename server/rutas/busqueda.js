const express = require('express');
const moment = require('moment');

const app = express();

let Articulo = require('../modelo/articulo');
let Cliente = require('../modelo/cliente');
let Domicilio = require('../modelo/domicilio');
let Pedido = require('../modelo/pedido');
let Rubro = require('../modelo/rubro');
let Usuario = require('../modelo/usuario');

let { verifyToken, verifyRole } = require('../middlewares/auth');

app.get('/busqueda/todo/:termino', (req, res) => {
    let busqueda = req.params.termino;
    let regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarRubros(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                rubros: respuestas[0],
                usuarios: respuestas[1]
            });
        })
});

function buscarRubros(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Rubro.find({ denominacion: regex }, (err, rubros) => {
            if (err) {
                reject('Error al cargar rubros', err);
            }
            resolve(rubros);
        });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find()
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            });
    });
}

module.exports = app;