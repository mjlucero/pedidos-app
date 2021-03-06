var mongoose = require('mongoose');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var clienteSchema = new Schema({
    razonSocial: { type: String, required: [true, 'La razon social es necesaria'] },
    domicilio: { type: mongoose.Schema.Types.ObjectId, ref: 'Domicilio', required: [true, 'El domicilio es necesario'] },
    cuit: { type: Number, unique: true, required: [true, 'El cuit es necesario'] },
    saldo: { type: Number, default: 0.00 },
    fechaAlta: { type: String },
    fechaBaja: { type: String, default: null }
}, { collection: 'clientes' });

clienteSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Cliente', clienteSchema);