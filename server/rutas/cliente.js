const express = require('express');
const moment = require('moment');

let { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

let Cliente = require('../modelo/cliente');

//Obtener todos los clientes
app.get('/clientes', verifyToken, (req, res) => {

    //Desde
    let desde = req.query.desde || 0;
    desde = Number(desde);

    //Limite
    let limite = req.query.limite || 5;
    limite = Number(limite);

    if (!isNaN(desde) && !isNaN(limite)) {
        Cliente.find({})
            .skip(desde)
            .limit(limite)
            .sort('razonSocial')
            .exec((err, clientes) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando clientes',
                        errores: err
                    });
                }

                Cliente.count({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando clientes',
                            errores: err
                        });
                    }

                    res.json({
                        ok: true,
                        total: conteo,
                        clientes
                    });
                });
            })
    } else {
        res.status(403).json({
            ok: false,
            mensaje: 'El parametro desde o limite no es valido',
            errores: { message: 'El parametro desde debe o limite ser un numero valido' }
        });
    }

});

//Obtener cliente por id
app.get('/cliente/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    Cliente.findById(id, (err, cliente) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando el cliente',
                errores: err
            });
        }

        if (!cliente) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se encontro el cliente que buscaba',
                errores: {
                    message: 'No se encontro el usuario con el id ' + id
                }
            });
        }

        res.json({
            ok: true,
            cliente
        });
    });
});

//Crear cliente
app.post('/cliente', verifyToken, (req, res) => {
    let cliente = new Cliente();

    Object.keys(req.body).forEach(key => {
        cliente[key] = req.body[key];
    });

    cliente.fechaAlta = moment().format('DD-MM-YYYY');

    cliente.save((err, clienteStored) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear el cliente',
                errores: err
            });
        }

        res.json({
            ok: true,
            mensaje: 'Cliente creado exitosamente',
            cliente: clienteStored
        });
    });
});

//Editar cliente
app.put('/cliente/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    Cliente.findByIdAndUpdate(id, req.body, { new: true }, (err, clienteEdited) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error actualizando el cliente',
                errores: err
            });
        }

        res.json({
            ok: true,
            mensaje: 'Cliente actualizado exitosamente',
            cliente: clienteEdited
        });
    });
});

module.exports = app;