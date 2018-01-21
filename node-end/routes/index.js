var express = require('express');
var request = require('request');
var router = express.Router();
var utils = require('./../utils/index.js');
var Model = require('./../models/model');
var config = require('./../config/index.js');
var services = require('./../services/index');

router.get('/', function(req, res, next) {
  res.json({ author: 'suvllian'})
})

// 获取订单类型信息
router.get('/get_order_tpye_info/:id', function(req, res, next) {
  var orderType = req.params.id

  new Model('query_order_type_info').operate([orderType]).then(result => {
    utils.successRes(res, {data: result})
  }).catch(error => {
    utils.failRes(res)
  })
})

// 获取卡券列表
router.get('/get_card_list', function(req, res, next) {

  new Model('query_coupons_list').operate().then(result => {
    return utils.successRes(res, {
      data: result
    })
  }).catch(error => {
    return utils.failRes(res, {
      msg: '获取卡券列表失败'
    })
  })
})

router.post('/order_success', function(req, res, next) {
  console.log(req.body)
  console.log(req.params)
})

module.exports = router;
