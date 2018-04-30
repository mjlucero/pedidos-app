const express = require('express');
const moment = require('moment');

let { verifyToken,verifyRole } = require('../middlewares/auth');

const app = express();

let Pedido = require('../modelo/pedido');

//Obtener todos los pedidos
app.get('/pedidos', verifyToken, ( req,res )=>{

    //Desde
    let desde = req.query.desde || 0;
    desde = Number( desde );

    //Limite
    let limite = req.query.limite || 5;
    limite = Number( limite );

    if ( !isNaN( desde ) && !isNaN( limite ) ) {
        Pedido.find({})
                .skip( desde )
                .limit( limite )
                .sort( 'razonSocial' )
                .exec(( err,pedidos )=>{
                    if ( err ) {
                        return res.status(500).json({
                            ok:false,
                            mensaje: 'Error cargando pedidos',
                            errores: err
                        });
                    }

                    Pedido.count({}, ( err,conteo )=>{
                        if ( err ) {
                            return res.status(500).json({
                                ok:false,
                                mensaje: 'Error contando pedidos',
                                errores: err
                            });
                        }

                        res.json({
                            ok:true,
                            total: conteo,
                            pedidos
                        });
                    });
                })
    } else {
        res.status(403).json({
            ok:false,
            mensaje: 'El parametro desde o limite no es valido',
            errores: { message: 'El parametro desde debe o limite ser un numero valido'}
        });
    }

});

//Obtener pedido por id
app.get('/pedido/:id', ( req,res )=>{
    let id = req.params.id;

    Pedido.findById( id, ( err,pedido )=>{
        if ( err ) {
            return res.status(500).json({
                ok:false,
                mensaje: 'Error buscando el pedido',
                errores: err
            });
        }

        if ( !pedido ) {
            return res.status(404).json({
                ok:false,
                mensaje: 'No se encontro el pedido que buscaba',
                errores: {
                    message: 'No se encontro el usuario con el id '+id
                }
            });
        }

        res.json({
            ok:true,
            pedido
        });
    });
});

//Crear pedido
app.post('/pedido', verifyToken, ( req,res )=>{
    let pedido = new Pedido();

    Object.keys(req.body).forEach( key=>{
        pedido[key] = req.body[key];
    });

    pedido.fechaAlta = moment().format('DD-MM-YYYY HH:mm:ss');

    pedido.save(( err, pedidoStored )=>{
        if ( err ) {
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al crear el pedido',
                errores: err
            });
        }

        res.json({
            ok:true,
            mensaje: 'Pedido creado exitosamente',
            pedido: pedidoStored
        });
    });
});

//Editar pedido
app.put('/pedido/:id', verifyToken, ( req,res )=>{
    let id = req.params.id;
    let body = req.body;

    Pedido.findByIdAndUpdate( id, body, { new: true, runValidators:true }, ( err,pedidoEdited )=>{
        if ( err ) {
            return res.status(500).json({
                ok:true,
                mensaje: 'Error actualizando el pedido',
                errores: err
            });
        }

        res.json({
            ok:true,
            mensaje: 'Pedido actualizado exitosamente',
            pedido: pedidoEdited
        });
    });
});



module.exports = app;