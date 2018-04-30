'use strict'

const express = require('express');
const app = express();

const port = process.env.PORT || 8081

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

require('./routes.js')(app);

app.listen(port);
