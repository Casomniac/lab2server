var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var {JSONRPCServer} = require('json-rpc-2.0');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const server = new JSONRPCServer();

let noticeList = [];
let id = 0;

server.addMethod('submit', (notice) => {
  notice.id = id;
  notice.date = new Date(Date.now()).toLocaleDateString('ru-RU');
  notice.time = new Date(Date.now()).toLocaleTimeString('ru-RU');
  id++;
  const io = app.get('io');

  noticeList.push(notice);
  io.sockets.emit('new notice', noticeList);
  return 'ok'
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post('/json-rpc', (req, res) => {
  const jsonRPCRequest = req.body;
  // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
  server.receive(jsonRPCRequest).then(jsonRPCResponse => {
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      // If response is absent, it was a JSON-RPC notification method.
      // Respond with no content status (204).
      res.sendStatus(204);
    }
  });
});
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

exports.noticeList = noticeList;
exports.app = app;
