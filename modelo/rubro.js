var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rubroSchema = new Schema({
    codigo: { type: String, unique: true ,required: [true, 'El código es requerido']},
    denominacion: { type: String, required: [true, 'La denominación es requerida']},
    subRubro:[{ type: mongoose.Schema.Types.ObjectId, ref : 'Rubro' }],
    fechaAlta: { type: String },
    fechaBaja: { type: String}
});

module.exports = mongoose.model('Rubro', RubroSchema);
