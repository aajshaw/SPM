'use strict'

const express = require('express');
const app = express();

const port = process.env.PORT || 8081

require('./routes.js')(app);

app.listen(port);
console.log("Listening on port " + port);
