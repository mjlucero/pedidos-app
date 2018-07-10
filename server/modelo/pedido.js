var mongoose = require('mongoose');

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var estadosValidos = {
    values: ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'ANULADO'],
    message: '{VALUE} no es un estado permitido'
}

var pedidoSchema = new Schema({
    detalles: [{
        _id: false,
        articulo: { type: mongoose.Schema.Types.ObjectId, ref: 'Articulo', required: [true, 'El articulo es necesario'] },
        cantidad: { type: Number, required: [true, 'La cantidad es necesaria'] },
        descuento: { type: Number, required: [true, 'El descuento es necesario'] },
        subtotal: { type: Number, required: [true, 'El subtotal es necesario'] },
    }],
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: [true, 'El cliente es necesario'] },
    fechaEntregaEstimada: { type: String, required: [true, 'La fecha de entrega estimada es necesaria'] },
    domicilio: { type: mongoose.Schema.Types.ObjectId, ref: 'Domicilio', required: [true, 'El domicilio es necesario'] },
    gastoEnvio: { type: Number, required: [true, 'El gasto de envio es necesario'] },
    estado: { type: String, required: true, default: 'PENDIENTE', enum: estadosValidos },
    entregado: { type: Boolean, required: true, default: false },
    fechaPedido: { type: String, required: [true, 'La fecha de pedido es necesaria'] },
    numero: { type: Number, unique: true },
    subtotal: { type: Number, required: [true, 'El subtotal es necesario'] },
    total: { type: Number, required: [true, 'El total es necesario'] },
    migrado: { type: Boolean, default: false },
    fechaAlta: { type: String },
    fechaBaja: { type: String, default: null }
}, { collection: 'pedidos' });


let populateAll = function(next) {
    this.populate('detalles.articulo', '_id denominacion rubro')
        .populate('cliente', '_id razonSocial');
    next();
}

let autoIncrementNumber = function(next) {
    var self = this;

    this.constructor.findOne({})
        .sort({ numero: -1 })
        .exec(function(err, data) {
            if (!data) {
                self.numero = 1;
            } else {
                self.numero = data.numero + 1;
            }

            next()
        });

}

pedidoSchema.pre('find', populateAll)
    .pre('findOne', populateAll)
    .pre('save', autoIncrementNumber);


pedidoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Pedido', pedidoSchema);