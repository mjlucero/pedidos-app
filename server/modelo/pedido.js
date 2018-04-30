var mongoose = require('mongoose')
require('mongoose-long')(mongoose)
require('mongoose-double')(mongoose);

var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var estadosValidos = {
    values: ['PENDIENTE','ENVIADO','ENTREGADO','ANULADO'],
    message: '{VALUE} no es un estado permitido' 
}

var pedidoSchema = new Schema({
    detalles: [{
        _id: false, 
        articulo: { type: mongoose.Schema.Types.ObjectId, ref : 'Articulo', unique: true, required:[true,'El articulo es necesario'] },
        cantidad: { type: Number, required:[true,'La cantidad es necesaria'] },
        descuento: { type: Number, required:[true, 'El descuento es necesario'] },
        subtotal: { type: Number, required:[true, 'El subtotal es necesario'] },
    }],
    cliente: { type: mongoose.Schema.Types.ObjectId, ref : 'Cliente', unique: true, required:[true,'El cliente es necesario'] },
    fechaEntregaEstimada: { type: String, required:[true, 'La fecha de entrega estimada es necesaria'] },
    domicilio: { type: mongoose.Schema.Types.ObjectId, ref : 'Domicilio', required:[true,'El domicilio es necesario'] },
    gastoEnvio: { type: Number, required:[true, 'El gasto de envio es necesario'] },
    estado: { type: String, required:true, default: 'PENDIENTE', enum: estadosValidos },
    entregado: { type: Boolean, required:true, default: false },
    fechaPedido: { type: String, required:[true, 'La fecha de pedido es necesaria'] },
    numero: { type: Number, unique: true, required:[true,'El numero de pedido es necesario'] },
    total: { type: Number, required:[true, 'El total es necesario'] },
},{ collection: 'pedidos' } );


let populateAll = function(next){
    this.populate('detalles.articulo', '_id denominacion rubro')
        .populate('cliente', '_id razonSocial');
    next();
}

pedidoSchema.pre('find', populateAll )
                .pre('findOne', populateAll);

pedidoSchema.plugin( uniqueValidator,{ message:'{PATH} debe ser unico'} );

module.exports = mongoose.model('Pedido', pedidoSchema);