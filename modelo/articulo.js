var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var articuloSchema = new Schema({
    denominacion: { type: String, required:[true,'La denominacion es necesaria'] },
    codigo: { type: String, unique: true, required:[true, 'El cogido es necesario'] },
    precioCompra: { type: SchemaTypes.Double, required:[true, 'El precio de compra es necesario'] },
    precioVenta: { type: SchemaTypes.Double, required:[true, 'El precio de venta  es necesario'] },
    iva: { type: SchemaTypes.Double, required:[true, 'El iva es necesario'] }
},{ collection: 'articulos' } );

articuloSchema.plugin( uniqueValidator,{ message:'{PATH} debe ser unico'} );

module.exports = mongoose.model('Articulo', articuloSchema);