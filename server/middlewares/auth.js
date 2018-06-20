const jwt = require('jsonwebtoken');


let verifyToken = (req, res, next) => {
    let token = req.get('Authorization');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido',
                errores: err
            });
        }

        req.usuario = decoded.usuario;
        next();

    });
}


let verifyRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {

        return res.json({
            ok: false,
            mensaje: 'El usuario no es adminstrador',
            errores: {
                message: 'El usuario es del tipo administrador'
            }
        });

    }
}


module.exports = {
    verifyToken,
    verifyRole
}