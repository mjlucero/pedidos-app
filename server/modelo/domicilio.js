var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var domicilioSchema = new Schema({
    direccion: { type: String, required: [true, 'La direccion es necesaria'] },
    latitud: { type: Number },
    longitud: { type: Number },
    fechaAlta: { type: String },
    fechaBaja: { type: String, default: null }
}, { collection: 'domicilios' });

module.exports = mongoose.model('Domicilio', domicilioSchema);