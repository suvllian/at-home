var express = require('express');
var request = require('request');
var crypto = require('crypto');
var UUId = require('uuid');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true});
var xmlBuilder = new xml2js.Builder();
var router = express.Router();
var utils = require('./../utils/index.js');
var Model = require('./../models/model');
var config = require('./../config/index.js');
var services = require('./../services/index');

//
function getSignCode() {

}

router.get('/', function(req, res, next) {
  res.json({ author: 'suvllian'})
})


router.post('/pay_order', function(req, res, next) {
  var { orderId, loginCode, totalFee } = req.body

  if (!orderId || !totalFee) {
    return utils.failRes(res)
  }

  services.getOpenId(loginCode).then(result => {
    var { openid } = result

    if (!openid) {
      return utils.failRes(res)
    }

    const params = {
      // 小程序id
      appid: config.APPID,
      // 
      body: '在乎',
      // 商户号
      mch_id: config.PAYUSERID,
      // 随机字符串
      nonce_str: UUId.v1().substring(0, 31),
      // 通知地址
      notify_url: 'https://zaihu.zhangguanzhang.com/order_success',
      // 用户标识
      openid: openid,
      // 商户订单号
      out_trade_no: orderId,
      // 终端ip
      spbill_create_ip: '120.79.91.119',
      // 标价金额
      total_fee: parseInt(totalFee * 100),
      //
      trade_type: 'JSAPI',
      // 
      key: config.PAYSECRET    
    }

    var sign = crypto.createHash("md5").update(utils.parseObjectParams(params)).digest('hex').toString()

    var requestValue = '<xml>' + 
      '<appid>' + params.appid + '</appid>' +
      '<mch_id>' + params.mch_id + '</mch_id>' +
      '<nonce_str>' + params.nonce_str + '</nonce_str>' +
      '<body>' + params.body + '</body>' +
      '<out_trade_no>' + params.out_trade_no + '</out_trade_no>' +
      '<total_fee>' + params.total_fee + '</total_fee>' +
      '<spbill_create_ip>' + params.spbill_create_ip + '</spbill_create_ip>' +
      '<notify_url>' + params.notify_url + '</notify_url>' +
      '<trade_type>' + params.trade_type + '</trade_type>' +
      '<openid>' + params.openid + '</openid>' + 
      '<sign>' + sign + '</sign>' +
      '</xml>'

    request.post({
      url: config.PAYURL,
      body: requestValue        
    }, function(error, orderResult, data) {
      xmlParser.parseString(data, function(err, finalResult) {
        if (!err) {
          var wechatPayResult = finalResult['xml']
          if (wechatPayResult) {
            console.log(wechatPayResult)
            return utils.successRes(res, {
              data: {
                prepay_id: wechatPayResult['prepay_id'],
                nonce_str: wechatPayResult['nonce_str']
              }
            })
          } else {
            return utils.failRes(res)
          }
        } else {
          return utils.failRes(res)
        }
      })
    })
  })
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

// 获取订单列表
router.get('/get_order_list/:login_code', function(req, res, next) {
  var loginCode = req.params.login_code

  if (!loginCode) {
    return utils.failRes(res, {
      msg: '获取loginCode失败'
    })
  }

  services.getOpenId(loginCode).then(result => {
    var { openid } = result

    if (!openid) {
      return utils.failRes(res, {
        msg: '获取订单列表失败'
      })
    }

    new Model('query_order_list').operate([openid]).then(result => {
      utils.successRes(res, {
        data: result
      })
    })
    .catch(error => {
      return utils.failRes(res, {
        msg: '获取订单列表失败'
      })
    })
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
})

module.exports = router;
