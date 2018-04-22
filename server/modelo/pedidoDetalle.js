var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var pedidoDetalleSchema = new Schema({
    articulo: { type: mongoose.Schema.Types.ObjectId, ref : 'Articulo', unique: true, required:[true,'El articulo es necesario'] },
    cantidad: { type: Number, required:[true,'La cantidad es necesaria'] },
    descuento: { type: SchemaTypes.Double, required:[true, 'El descuento es necesario'] },
    subtotal: { type: SchemaTypes.Double, required:[true, 'El subtotal es necesario'] }
},{ collection: 'pedidoDetalles' } );

pedidoDetalleSchema.plugin( uniqueValidator,{ message:'{PATH} debe ser unico'} );

module.exports = mongoose.model('PedidoDetalle', pedidoDetalleSchema);