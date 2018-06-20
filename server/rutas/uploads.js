const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();


const Usuario = require('../modelo/usuario');
const Articulo = require('../modelo/articulo');

const fs = require('fs');
const path = require('path');

const { verifyToken } = require('../middlewares/auth');

app.use(fileUpload());

/**
 * Servicio para obtener las imagenes
 */
app.get('/imagen/:tipo/:img', verifyToken, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;


    let pathUrl = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);
    console.log(pathUrl);
    if (fs.existsSync(pathUrl)) {
        res.sendFile(pathUrl);
    } else {
        let pathNoImg = path.resolve(__dirname, '../assets/no-image.png');
        res.sendFile(pathNoImg);
    }
});


/**
 * Servicio para subir imagenes
 */
app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    //Validar tipos
    let tiposValidos = ['usuarios', 'articulos'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                tipo,
                message: 'Las tipos permitidas son ' + tiposValidos.join(', ')
            }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    let image = req.files.image;
    let nameSp = image.name.split('.');
    let extension = nameSp[nameSp.length - 1];

    //Extensiones permitidas
    let extensiones = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensiones.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                ext: extension,
                message: 'Las extensiones permitidas son ' + extensiones.join(', ')
            }
        });
    }

    // Cambiar nombre al archivo
    let name = `${ id }-${ new Date().getMilliseconds() }.${ extension}`


    image.mv(`uploads/${ tipo }/${ name }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (tipo === 'usuarios') {
            imageUsuario(id, res, name);
        } else {
            imageArticulo(id, res, name);
        }

    });

});

function imageUsuario(id, res, name) {

    Usuario.findById(id, (err, usuario) => {
        if (err) {

            deleteFile(name, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuario) {

            deleteFile(name, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        deleteFile(usuario.img, 'usuarios');

        usuario.img = name;

        usuario.save((err, usuarioEdited) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioEdited,
                img: name
            });
        });
    });
}

function imageArticulo(id, res, name) {
    Articulo.findById(id, (err, articulo) => {
        if (err) {

            deleteFile(name, 'articulos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!articulo) {

            deleteFile(name, 'articulos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El articulo no existe'
                }
            });
        }

        deleteFile(articulo.img, 'articulos');

        articulo.img = name;

        articulo.save((err, articuloEdited) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                articulo: articuloEdited,
                img: name
            });
        });
    });
}

function deleteFile(name, tipo) {
    let pathUrl = path.resolve(__dirname, `../../uploads/${ tipo }/${ name }`);

    if (fs.existsSync(pathUrl)) {
        fs.unlinkSync(pathUrl);
    }
}

module.exports = app;