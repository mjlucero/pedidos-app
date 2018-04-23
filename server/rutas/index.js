var express = require('express');

var app = express();

app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./rubro'));
app.use(require('./articulo'));
app.use(require('./cliente'));

module.exports = app;