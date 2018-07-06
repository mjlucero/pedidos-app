const express = require('express');
const moment = require('moment');

let { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

let Articulo = require('../modelo/articulo');

app.get('/articulos', verifyToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite)

    if (!isNaN(desde) && !isNaN(limite)) {
        Articulo.find({})
            .skip(desde)
            .limit(limite)
            .exec((err, articulos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error buscando los articulos',
                        errores: err
                    });
                }

                Articulo.count({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando articulos',
                            errores: err
                        });
                    }

                    res.json({
                        ok: true,
                        total: conteo,
                        articulos
                    });
                });
            });
    } else {
        res.status(403).json({
            ok: false,
            mensaje: 'El parametro desde no es valido',
            errores: { message: 'El parametro desde debe ser un numero valido' }
        });
    }
});

app.get('/articulo/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    Articulo.findById(id, (err, articulo) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando el articulo',
                errores: err
            })
        }

        if (!articulo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro el articulo con este id',
                errores: {
                    message: 'No existe el articulo con este ID: ' + id
                }
            });
        }

        res.json({
            ok: true,
            articulo
        });
    });
});

app.post('/articulo', [verifyToken, verifyRole], (req, res) => {
    let articulo = new Articulo();

    Object.keys(req.body).forEach(key => {
        articulo[key] = req.body[key]
    });

    articulo.precioCompra = parseFloat(articulo.precioCompra);
    articulo.precioVenta = parseFloat(articulo.precioVenta);
    articulo.iva = parseFloat(articulo.iva);
    articulo.fechaAlta = moment().format('DD-MM-YYYY');

    articulo.save((err, articuloStored) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                errores: err
            });
        }

        res.json({
            ok: true,
            articulo: articuloStored
        });
    });
});

app.put('/articulo/:id', [verifyToken, verifyRole], (req, res) => {
    let id = req.params.id;

    Articulo.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }, (err, articuloEdited) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al intentar actualizar el articulo',
                errores: err
            });
        }

        res.json({
            ok: true,
            articulo: articuloEdited
        });
    });
});

module.exports = app;