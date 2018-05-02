const express = require('express');
const moment = require('moment');

let { verifyToken,verifyRole } = require('../middlewares/auth');

const app = express();

let Pedido = require('../modelo/pedido');
let Cliente = require('../modelo/cliente');

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
app.get('/pedido/:id', verifyToken, ( req,res )=>{
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
                    message: 'No se encontro el pedido con el id '+id
                }
            });
        }

        res.json({
            ok:true,
            pedido
        });
    });
});


let calcularSubtotal = ( detalles )=>{
    let subtotal = 0

    for (let index = 0; index < detalles.length; index++) {
        subtotal += detalles[index].subtotal;
        
    }

    return subtotal.toFixed(2);
}

let calcularTotal = ( gastoEnvio,subTotal )=>{
    return ( gastoEnvio + subTotal).toFixed(2);
}

//Crear pedido
app.post('/pedido', verifyToken, ( req,res )=>{
    let pedido = new Pedido();

    Object.keys(req.body).forEach( key=>{
        pedido[key] = req.body[key];
    });

    pedido.subtotal = calcularSubtotal( pedido.detalles );
    pedido.total = calcularTotal( pedido.gastoEnvio,pedido.subtotal );
    pedido.fechaAlta = moment().format('DD-MM-YYYY HH:mm:ss');


    pedido.save(( err, pedidoStored )=>{
        if ( err ) {
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al crear el pedido',
                errores: err
            });
        }

        let saldoCliente = (- Math.abs(pedidoStored.total) );

        Cliente.findById( pedidoStored.cliente, ( err,cliente )=>{
            if ( err ) {
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error busncado el cliente',
                    errores: err
                });
            }

            if ( !cliente ) {
                return res.status(400).json({
                    ok:false,
                    mensaje: 'No se encontro el cliente con este ID',
                    errores: err
                });
            }

            cliente.saldo = saldoCliente + cliente.saldo;

            cliente.save(( err,clienteEdited )=>{
                if ( err ) {
                    return res.status(500).json({
                        ok:false,
                        mensaje: 'Error actualizando el saldo del cliente',
                        errores: err
                    });
                }
                    
                res.json({
                    ok:true,
                    mensaje: 'Pedido creado exitosamente y saldo del cliente actualizado',
                    pedido: pedidoStored
                });
            })
        });
        
    });
});

//Editar pedido
app.put('/pedido/:id', verifyToken, ( req,res )=>{
    let id = req.params.id;
    let body = req.body;


    Pedido.findById( id, ( err,pedido )=>{
        if ( err ) {
            return res.status(500).json({
                ok:false,
                mensaje: 'Error buscando el pedido',
                errores: err
            });
        }

        if ( !pedido ) {
            return res.status(400).json({
                ok:false,
                mensaje: 'No se encontro el pedido con este ID',
                errores: err
            });
        }

        let pedidoOriginal = pedido;

        let totalOriginal= pedido.total;

        Object.keys( body ).forEach( key =>{
            pedido[key] = body[key];
        });

        pedido.subtotal = calcularSubtotal( pedido.detalles );
        pedido.total = calcularTotal( pedido.gastoEnvio,pedido.subtotal );

        pedido.save(( err,pedidoEdited )=>{
            if ( err ) {
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error actualizando el pedido',
                    errores: err
                });
            }

            Cliente.findById( pedidoEdited.cliente, ( err,cliente )=>{
                    if ( err ) {
                        return res.status(500).json({
                            ok:false,
                            mensaje: 'Error busncado el cliente',
                            errores: err
                        });
                    }
        
                    if ( !cliente ) {
                        return res.status(400).json({
                            ok:false,
                            mensaje: 'No se encontro el cliente con este ID',
                            errores: err
                        });
                    }

                    //Si es pendiente o enviado el saldo sera negativo
                    if ( pedidoEdited.estado == "PENDIENTE" ||  pedidoEdited.estado == "ENVIADO" ) {
                        //Pero si el total anterior es igual al nuevo significa que no se cambio nada
                        if ( totalOriginal == pedidoEdited.total ) {
                            //Por lo tanto no se va cambiar el saldo y se devulve la respuesta
                            return  res.json({
                                        ok:true,
                                        mensaje: 'Pedido actualizado exitosamente',
                                        pedido: pedidoEdited
                                    });
                        } else { //Si el total cambio desde el original almacenado
                            
                            //Se anula el saldo anteriormente guardado
                            cliente.saldo = cliente.saldo + totalOriginal;
                            
                            //Se sumara directamente el nuevo al saldo negativo el nuevo total
                            cliente.saldo = -pedidoEdited.total + cliente.saldo
                        }
                    }else{ //En el caso de que cambie de estado a 'ENTREGADO' o 'ANULADO'
                        //Se anula el saldo
                        if ( cliente.saldo < 0 ) {
                            cliente.saldo = cliente.saldo + totalOriginal;
                        }
                    }

                    if ( cliente.saldo > 0) {

                        pedidoOriginal.save(( err,pedidoRollBack )=>{
                            if ( err ) {
                                return res.status(500).json({
                                    ok:false,
                                    mensaje: 'Error volviendo atras los cambios por que el saldo del cliente no puede ser mayor a 0',
                                    errores: err
                                });
                            }

                            return  res.json({
                                        ok:true,
                                        mensaje: 'Se volvio atras los datos del pedido por que el saldo del cliente era mayor a 0',
                                        pedido: pedidoRollBack
                                    })
                        });
                    }
      
                    cliente.save(( err,clienteEdited )=>{
                        if ( err ) {
                            return res.status(500).json({
                                ok:false,
                                mensaje: 'Error actualizando el saldo del cliente',
                                errores: err
                            });
                        }
                            
                        res.json({
                            ok:true,
                            mensaje: 'Pedido y saldo del cliente actualizados exitosamente',
                            pedido: pedidoEdited
                        });
                    })
                }); 
        });
    });
});

module.exports = app;