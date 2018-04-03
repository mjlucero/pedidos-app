var express = require('express');
var moment = require('moment');
var bcrypt = require('bcryptjs');

var app = express();
var Usuario = require('../modelo/usuario');

var mdAuth = require('../middlewares/auth');

//Obtener los usuarios
app.get('/', (req,res,next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    if (!isNaN(desde)) {
        Usuario.find({}, 'nombre email role fechaAlta fechaBaja')
           .skip(desde)
           .limit(10)
           .exec(
                ( err,usuarios )=>{
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando usuarios',
                            errores: err
                        });
                    }

                    Usuario.count({}, (err, conteo)=>{
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error contando usuarios',
                                errores: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            total: conteo,
                            usuarios 
                        });
                    });
                });
    } else {
        res.status(403).json({
            ok:false,
            mensaje: 'El parametro desde no es valido',
            errores: { message: 'El parametro desde debe ser un numero valido'}
        });
    }

    
});

//Crear usuario
app.post('/', mdAuth.verifyToken, (req, res, next)=>{
    var usuario = new Usuario();

    Object.keys(req.body).forEach(key => {
        usuario[key] = req.body[key];
    });

    usuario.password = bcrypt.hashSync(usuario.password, 10);
    usuario.fechaAlta = moment().format('DD-MM-YYYY HH:mm:ss');

    usuario.save(( err,usuarioStored )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errores: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioStored 
        });
    });
});

//Actualizar usuario
app.put('/:id', ( req,res )=>{
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id,( err,usuario )=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje: 'Eror al buscar el usuario',
                errores: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok:false,
                mensaje: 'Usuario con el id '+id+' no existe',
                errores: { message: 'No existe un usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.fechaBaja = body.fechaBaja;

        usuario.save( (err,usuarioStored)=>{
            if (err) {
               return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
               });
            }

            usuarioStored.password = 'Aqui estaria el password';

            res.status(200).json({
                ok: true,
                usuario: usuarioStored
            });
        });

        
    });
});

module.exports = app;