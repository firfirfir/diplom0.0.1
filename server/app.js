var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

app.listen(100);

app.use(bodyParser.json());
app.use(cookieParser());

app.set('view engine', 'jade');
app.use("/public", express.static('./public'));
app.use("/node_modules", express.static('./../node_modules'));
app.use("/uploads", express.static('./uploads'));

require('./controllers/main')(app);

console.log('Listen on port 100');

