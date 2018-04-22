const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;


let articuloSchema = new Schema({
    denominacion: { type: String, required:[true,'La denominacion es necesaria'] },
    codigo: { type: String, unique: true, required:[true, 'El cogido es necesario'] },
    precioCompra: { type: Number, required:[true, 'El precio de compra es necesario'] },
    precioVenta: { type: Number, required:[true, 'El precio de venta  es necesario'] },
    iva: { type: Number, required:[true, 'El iva es necesario'] },
    rubro: { type: mongoose.Schema.Types.ObjectId, ref : 'Rubro' },
    fechaAlta: { type: String },
    fechaBaja: { type: String, default: null}
},{ collection: 'articulos' } );

let autoPopulateRubro = function(next){
    this.populate('rubro');
    next();
}

articuloSchema.pre('find', autoPopulateRubro )
                .pre('findOne', autoPopulateRubro);

articuloSchema.plugin( uniqueValidator,{ message:'{PATH} debe ser unico'} );

module.exports = mongoose.model('Articulo', articuloSchema);