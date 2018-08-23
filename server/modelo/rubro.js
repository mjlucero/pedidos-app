var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rubroSchema = new Schema({
    codigo: { type: String, unique: true, required: [true, 'El código es requerido'] },
    denominacion: { type: String, required: [true, 'La denominación es requerida'] },
    padre: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubro' },
    fechaAlta: { type: String },
    fechaBaja: { type: String, default: null }
}, { collection: 'rubros' });

let autoPopulatePadre = function(next) {
    this.populate('padre');
    next();
}

rubroSchema.pre('find', autoPopulatePadre)
    .pre('findOne', autoPopulatePadre);

rubroSchema.plugin(uniqueValidator, { message: 'El {PATH} debe de ser unico' });

module.exports = mongoose.model('Rubro', rubroSchema);