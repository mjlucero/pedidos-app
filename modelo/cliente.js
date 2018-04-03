var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var clienteSchema = new Schema({
    razonSocial: { type:String, required:[true,'La razon social es necesaria'] },
    domicilio: { type: mongoose.Schema.Types.ObjectId, ref : 'Domicilio', required:[true,'El domicilio es necesario'] },
    cuit: { type: String, unique:true, required:[true,'El cuit es necesario'] },
    saldo: { type:SchemaTypes.Double, required:true, default: 0.00 }
},{ collection: 'clientes' } );

clienteSchema.plugin( uniqueValidator,{ message:'{PATH} debe ser unico'} );

module.exports = mongoose.model('Cliente', clienteSchema);