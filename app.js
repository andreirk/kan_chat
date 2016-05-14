var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var log = require('./libs/log')(module);
var mongoose = require('./libs/mongoose');
var HttpError = require('./error').HttpError;


var app = express();

app.engine('ejs',require('ejs-locals'));
app.set('port',config.get('port'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');
app.set('view options', {layout: '/layout/page.ejs'});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());

var  sessionStore = require('./libs/sessionStore');

app.use(express.session({
    secret: config.get('session:secret'),
    key: config.get("session:key"),
    cookie: config.get('session:cookie'),
    store: sessionStore
}));

// app.use(function (req, res, next) {
//     req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
//     res.send("Visits: " + req.session.numberOfVisits);
// });
app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/loaduser'));

app.use(app.router);
require('./routes')(app);
app.use(express.static(path.join(__dirname, 'public')));


app.use(function (err, req, res, next) {
  if (typeof err == 'number'){
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else
   if (app.get('env') == 'development'){
    var errorHandler = express.errorHandler();
    errorHandler(err, req, res, next)
  } else {
     log.error(err);
     err = new HttpError(500);
    res.sendHttpError(err);
  }
});


// var routes = require('./routes');
// var user = require('./routes/user');
//
// // all environments

// app.use(express.methodOverride());
// app.use(express.cookieParser('your secret here'));
// app.use(express.session());
// app.use(app.router);
// app.use(express.static(path.join(__dirname, 'public')));
//
// // development only
// if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
// }
//
// app.get('/', routes.index);
// app.get('/users', user.list);


var server = http.createServer(app);
server.listen(config.get('port'), function () {
  log.info('Express server listening on port ' + config.get('port'));
});

require('./socket')(server);