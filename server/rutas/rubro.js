const express = require('express');
const moment = require('moment');

let { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

let Rubro = require('../modelo/rubro');

//Obtener todos los rubros
app.get('/rubros', verifyToken, (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    if (!isNaN(desde) && !isNaN(limite)) {
        Rubro.find({})
            .skip(desde)
            .limit(limite)
            .sort('denominacion')
            .exec((err, rubros) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando rubros',
                        errores: err
                    });
                }

                Rubro.count({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando rubros',
                            errores: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        rubros
                    });
                });
            });
    } else {
        res.status(403).json({
            ok: false,
            mensaje: 'El parametro desde o limite no es valido',
            errores: { message: 'El parametro desde debe o limite ser un numero valido' }
        });
    }
});

//Obtener un rubro
app.get('/rubro/:id', verifyToken, (req, res, next) => {

    let id = req.params.id;

    Rubro.findById(id, (err, rubro) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando rubro',
                errores: err
            });
        }

        if (!rubro) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro el rubro con este id',
                errores: {
                    message: 'No existe categoria con este ID: ' + id
                }
            });
        }

        res.json({
            ok: true,
            rubro
        });
    });
});

//Crear rubro
app.post('/rubro', [verifyToken, verifyRole], (req, res, next) => {
    var rubro = new Rubro();

    Object.keys(req.body).forEach(key => {
        rubro[key] = req.body[key];
    });

    rubro.fechaAlta = moment().format('DD-MM-YYYY');

    rubro.save((err, rubroStored) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear rubro',
                errores: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Rubro creado exitosamente',
            rubro: rubroStored
        });
    });
});

//Actualizar rubro
app.put('/rubro/:id', [verifyToken, verifyRole], (req, res) => {
    let id = req.params.id;
    let body = req.body;

    // console.log(body);

    Rubro.findByIdAndUpdate(id, body, { new: true, runValidators: false }, (err, rubroEdited) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al intentar actualizar el rubro',
                errores: err
            });
        }

        res.json({
            ok: true,
            mensaje: 'Rubro actualizado exitosamente',
            rubro: rubroEdited
        });
    });
});

module.exports = app;