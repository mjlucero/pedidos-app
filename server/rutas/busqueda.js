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

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Promise.all([
            buscarRubros(regex, desde, limite),
            buscarUsuarios(regex, desde, limite),
            buscarArticulos(regex, desde, limite),
            buscarPedidos(busqueda, desde, limite),
            buscarClietes(regex, desde, limite),
            buscarDomicilios(regex, desde, limite)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                rubros: respuestas[0][0],
                usuarios: respuestas[1][0],
                articulos: respuestas[2][0],
                pedidos: respuestas[3][0],
                clientes: respuestas[4][0],
                domicilios: respuestas[5][0]
            });
        }).catch(err => {
            res.status(500).json({
                ok: false,
                message: 'Error buscando en todas las colecciones, detalle: ' + err[0],
                err: err[1]
            });
        });
});

app.get('/busqueda/:coleccion/:termino', (req, res) => {
    let busqueda = req.params.termino;
    let coleccion = req.params.coleccion;
    let regex = new RegExp(busqueda, 'i');

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let promesa;

    switch (coleccion) {
        case 'usuarios':
            promesa = buscarUsuarios(regex, desde, limite);
            break;

        case 'rubros':
            promesa = buscarRubros(regex, desde, limite);
            break;
        case 'articulos':
            promesa = buscarArticulos(regex, desde, limite);
            break;
        case 'clientes':
            promesa = buscarClietes(regex, desde, limite);
            break;
        case 'pedidos':
            promesa = buscarPedidos(busqueda, desde, limite);
            break;
        case 'domicilios':
            promesa = buscarDomicilios(regex, desde, limite);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, rubros, articulos, clientes, pedidos y domicilios',
                errores: { message: 'Tipo de coleccion no valido' }
            });
    }

    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [coleccion]: data[0],
            total: data[1]
        });
    }).catch(err => {
        res.status(500).json({
            ok: false,
            message: 'Error buscando en coleccion ' + coleccion + ', detalle: ' + err[0],
            err: err[1]
        });
    });
});

function buscarRubros(regex, desde, limite) {
    return new Promise((resolve, reject) => {
        Rubro.find()
            .or([{ 'denominacion': regex }, { 'codigo': regex }])
            .skip(desde)
            .limit(limite)
            .exec((err, rubros) => {
                if (err) {
                    reject(['rubros', err]);
                } else {

                    Rubro.count()
                        .or([{ 'denominacion': regex }, { 'codigo': regex }])
                        .exec((err, conteo) => {
                            if (err) {
                                reject(['Error al contar rubros filtrados', err]);
                            }

                            resolve([rubros, conteo]);
                        });
                }
            });
    });
}

function buscarUsuarios(regex, desde, limite) {

    return new Promise((resolve, reject) => {
        Usuario.find()
            .or([{ 'nombre': regex }, { 'email': regex }])
            .skip(desde)
            .limit(limite)
            .exec((err, usuarios) => {
                if (err) {
                    reject(['usuarios', err]);
                } else {

                    Usuario.count()
                        .or([{ 'nombre': regex }, { 'email': regex }])
                        .exec((err, conteo) => {
                            if (err) {
                                reject(['Error al contar usuarios filtrados', err]);
                            }

                            resolve([usuarios, conteo]);
                        });
                }
            });
    });
}

function buscarArticulos(regex, desde, limite) {
    return new Promise((resolve, reject) => {
        Articulo.find()
            .or([{ 'denominacion': regex }, { 'codigo': regex }])
            .skip(desde)
            .limit(limite)
            .exec((err, articulos) => {
                if (err) {
                    reject(['articulos', err]);
                } else {

                    Articulo.count()
                        .or([{ 'denominacion': regex }, { 'codigo': regex }])
                        .exec((err, conteo) => {
                            if (err) {
                                reject(['Error al contar articulos filtrados', err]);
                            }

                            resolve([articulos, conteo]);
                        });
                }
            });
    });
}

function buscarClietes(regex, desde, limite) {
    return new Promise((resolve, reject) => {
        Cliente.find()
            .or([{ 'razonSocial': regex }, { 'cuit': regex }])
            .skip(desde)
            .limit(limite)
            .exec((err, clientes) => {
                if (err) {
                    reject(['clientes', err]);
                } else {

                    Cliente.count()
                        .or([{ 'razonSocial': regex }, { 'cuit': regex }])
                        .exec((err, conteo) => {
                            if (err) {
                                reject(['Error al contar clientes filtrados', err]);
                            }

                            resolve([clientes, conteo]);
                        });
                }
            });
    });
}

function buscarPedidos(regex, desde, limite) {
    let busqueda = -1;

    if (!isNaN(Number(regex))) {
        busqueda = Number(regex);
    }

    return new Promise((resolve, reject) => {
        Pedido.find()
            .or([{ 'numero': busqueda }])
            .skip(desde)
            .limit(limite)
            .exec((err, pedidos) => {
                if (err) {
                    reject(['pedidos', err]);
                } else {

                    Pedido.count()
                        .or([{ 'numero': busqueda }])
                        .exec((err, conteo) => {
                            if (err) {
                                reject(['Error al contar clientes filtrados', err]);
                            }

                            resolve([pedidos, conteo]);
                        });
                }
            });
    });
}

function buscarDomicilios(regex, desde, limite) {
    return new Promise((resolve, reject) => {
        Domicilio.find()
            .or([{ 'calle': regex }, { 'localidad': regex }])
            .skip(desde)
            .limit(limite)
            .exec((err, domicilios) => {
                if (err) {
                    reject('Error al cargar domicilios', err);
                } else {

                    Domicilio.count()
                        .or([{ 'calle': regex }, { 'localidad': regex }])
                        .exec((err, conteo) => {
                            if (err) {
                                reject('Error al contar domicilios filtrados', err);
                            }

                            resolve([domicilios, conteo]);
                        });
                }
            });
    });
}


module.exports = app;