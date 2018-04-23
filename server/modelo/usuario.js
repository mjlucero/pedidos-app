const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol permitido' 
}

let usuarioSchema = new Schema({
    nombre: { type: String, required:[true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required:[true, 'El correo es necesario']},
    password: { type: String, required:[true,'EL password es necesario']},
    role: { type: String, default: 'USER_ROLE', enum: rolesValidos },
    cliente : { type: mongoose.Schema.Types.ObjectId, ref : 'Cliente'},
    fechaAlta: { type: String },
    fechaBaja: { type: String, default: null }
},{ collection: 'usuarios' } );


usuarioSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin( uniqueValidator,{ message:'{PATH} debe ser unico'} );

module.exports = mongoose.model('Usuario', usuarioSchema);