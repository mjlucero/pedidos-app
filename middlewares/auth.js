var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED ;

exports.verifyToken = (req, res, next)=>{
  if (!req.headers.authorization) {
    return res.status(403).send({message: 'La peticion no tiene la cabecera de autenticacion'});
  }
  
  var token = req.headers.authorization.replace(/['"]+/g, '');

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message : 'La sesion ha expirado debe volver a ingresar' });
      }else if (err.name === 'JsonWebTokenError') {
        return res.status(401).send({ message : 'Token invalido' });
      }
     
    }

    next();
  });

}