var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var domicilioSchema = new Schema({
    calle: { type:String, required:[true,'El nombre de la calle es necesario'] },
    numero: { type: Number, required:[true,'El numero es necesario'] },
    localidad: { type:String, required:[true,'La localidad es necesaria'] },
    latitud: { type: SchemaTypes.Double },
    longitud: { type: SchemaTypes.Double }
},{ collection: 'domicilios' } );

module.exports = mongoose.model('Domicilio', domicilioSchema);