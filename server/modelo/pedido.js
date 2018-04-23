var mongoose = require('mongoose')
require('mongoose-long')(mongoose)
require('mongoose-double')(mongoose);

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var estadosValidos = {
    values: ['PENDIENTE','ENVIADO','ENTREGADO','ANULADO'],
    message: '{VALUE} no es un estado permitido' 
}

var pedidoSchema = new Schema({
    detalles: [ { type: mongoose.Schema.Types.ObjectId, ref : 'PedidoDetalle', unique: true, required:[true,'El detalle es necesario'] }],
    cliente: [ { type: mongoose.Schema.Types.ObjectId, ref : 'Cliente', unique: true, required:[true,'El cliente es necesario'] }],
    fechaEntregaEstimada: { type: String, required:[true, 'La fecha de entrega estimada es necesaria'] },
    domicilio: { type: mongoose.Schema.Types.ObjectId, ref : 'Domicilio', required:[true,'El domicilio es necesario'] },
    gastoEnvio: { type: SchemaTypes.Double, required:[true, 'El gasto de envio es necesario'] },
    estado: { type: String, required:true, default: 'PENDIENTE', enum: estadosValidos },
    entregado: { type: Boolean, required:true, default: false },
    fechaPedido: { type: String, required:[true, 'La fecha de pedido es necesaria'] },
    numero: { type: SchemaTypes.Long, unique: true, required:[true,'El numero de pedido es necesario'] },
    subtotal: { type: SchemaTypes.Double, required:[true, 'El subtotal es necesario'] },
    total: { type: SchemaTypes.Double, required:[true, 'El total es necesario'] },
},{ collection: 'pedidos' } );

pedidoDetalleSchema.plugin( uniqueValidator,{ message:'{PATH} debe ser unico'} );

module.exports = mongoose.model('PedidoDetalle', pedidoDetalleSchema);