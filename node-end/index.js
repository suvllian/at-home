var express = require('express');
var path = require('path');
var fs = require('fs');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var index = require('./routes/index.js');
var auth = require('./routes/auth.js');
var address = require('./routes/address.js');
var order = require('./routes/order.js');
var coupon = require('./routes/coupons.js');
var zaihu = require('./routes/zaihu.js');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  next();
})

app.use('/', index);
// 权限操作：登录、注册、获取验证码
app.use('/auth/', auth);
// 地址：添加地址，获取地址
app.use('/address/', address);
// 订单：下单，获取订单list
app.use('/order/', order);
// 卡包和券操作
app.use('/coupon/', coupon);
// admin
app.use('/zaihu/', zaihu);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
