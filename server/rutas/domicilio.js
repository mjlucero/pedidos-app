const express = require('express');
const moment = require('moment');

let { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

let Domicilio = require('../modelo/domicilio');

app.get('/domicilios', verifyToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    if (!isNaN(desde) && !isNaN(limite)) {
        Domicilio.find({})
            .skip(desde)
            .limit(limite)
            .exec((err, domicilios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error buscando los domicilios',
                        errores: err
                    });
                }

                Domicilio.count({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando los domicilios',
                            errores: err
                        });
                    }

                    res.json({
                        ok: true,
                        total: conteo,
                        domicilios
                    });
                });
            });
    } else {
        res.status(500).json({
            ok: false,
            mensaje: 'Los parametros desde y/o limite no son numeros',
            errores: {
                message: `${desde} no es un valor valido para el parametro desde y/o ${limite} no es un valor valido para el parametro limite`
            }
        });
    }
});

app.get('/domicilio/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    Domicilio.findById(id, (err, domicilio) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando el domicilio',
                errores: err
            });
        }

        if (!domicilio) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro ningun domicilio con este id',
                errores: {
                    message: `No se encontro ningun domicilio con el id:${id}`
                }
            });
        }

        res.json({
            ok: true,
            domicilio
        });
    });
});


app.post('/domicilio', verifyToken, (req, res) => {
    let domicilio = new Domicilio();

    Object.keys(req.body).forEach(key => {
        domicilio[key] = req.body[key];
    });

    domicilio.fechaAlta = moment().format('DD-MM-YYYY HH:mm:ss');

    domicilio.save((err, domicilioStored) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error guardando el domicilio',
                errores: err
            });
        }

        res.json({
            ok: true,
            mensaje: 'Se creo el domicilio exitosamente',
            domicilio: domicilioStored
        });
    });
});

app.put('/domicilio/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Domicilio.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, domicilioEdited) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error actualizando el domicilio',
                errores: err
            });
        }

        res.json({
            ok: true,
            mensaje: 'Domicilio actualizado exitosamente',
            domicilio: domicilioEdited
        });
    });
});

module.exports = app;