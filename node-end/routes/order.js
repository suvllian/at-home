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

router.post('/pay_order', function(req, res, next) {
  var { orderId, loginCode, totalFee, orderTime, createTime, addressId, orderParentType, orderTypeId, specificCount, phone } = req.body

  if (!orderId || !totalFee || !orderTime || !createTime || !addressId || !orderParentType || !orderTypeId || !phone) {
    return utils.failRes(res, {
      msg: '参数有误'
    })
  }

  totalFee = 0.01

  services.getOpenId(loginCode).then(result => {
    var { openid } = result

    if (!openid) {
      return utils.failRes(res, {
        msg: '登录失败'
      })
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
            // 插入订单信息到数据库
            new Model('query_userid_by_openid').operate([openid, phone]).then(userIdResult => {
              var userId = userIdResult && userIdResult[0] && userIdResult[0].id || 0
              var orderClassTypeId = orderId && parseInt(orderId[0])
              var orderDescription = ''

              if (orderParentType === 4 || orderParentType === 5 || orderParentType === 6) {
                orderDescription = specificCount.join(',')
              }

              if (orderClassTypeId == '1') {
                // 家政服务订单
                new Model('insert_new_order').operate([userId, orderId, orderParentType, orderTypeId, orderTime, orderDescription, createTime, totalFee, addressId, 0, 0]).then((newOrderResult = {}) => {
                  return newOrderResult.insertId ? utils.successRes(res, {
                    data: {
                      prepay_id: wechatPayResult['prepay_id'],
                      nonce_str: wechatPayResult['nonce_str']
                    }
                  }) : utils.failRes(res, {
                    msg: '下单失败1'
                  })
                })
                .catch(err => {
                  console.log(err)
                  return utils.failRes(res, {
                    msg: '下单失败2'
                  })
                })
              }
              
             })
             .catch(err => {
              console.log(err)
              return utils.failRes(res, {
                msg: '下单失败3'
              })
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

// 验证订单是否支付成功
router.post('/check_pay', function(req, res, next) {
  const { orderId } = req.body

  const params = {
    // 小程序id
    appid: config.APPID,
    // 商户号
    mch_id: config.PAYUSERID,
    // 随机字符串
    nonce_str: UUId.v1().substring(0, 31),
    // 商户订单号
    out_trade_no: orderId,
    // 
    key: config.PAYSECRET    
  }

  var sign = crypto.createHash("md5").update(utils.parseObjectParams(params)).digest('hex').toString()

  var requestValue = '<xml>' + 
      '<appid>' + params.appid + '</appid>' +
      '<mch_id>' + params.mch_id + '</mch_id>' +
      '<nonce_str>' + params.nonce_str + '</nonce_str>' +
      '<out_trade_no>' + params.out_trade_no + '</out_trade_no>' +
      '<sign>' + sign + '</sign>' +
      '</xml>'

  request.post({
    url: config.QUERYORDERSTATUSURL,
    body: requestValue        
  }, function(error, orderResult, data) {
    xmlParser.parseString(data, function(err, finalResult) {
      if (!err) {
        var wechatPayResult = finalResult['xml']
        if (wechatPayResult) {
          const payStatus = wechatPayResult['trade_state']
          
          if (payStatus === 'SUCCESS') {
            new Model('update_order_status').operate([orderId]).then(updateStatusResult => {
              return utils.successRes(res, {
                msg: '支付成功'
              })
            }).catch(error => {
              console.log(error)
              return utils.failRes(res, {
                msg: '支付失败'
              })
            })
            
          } else {
            return utils.failRes(res, {
              msg: '支付失败'
            })
          }
        } else {
          return utils.failRes(res)
        }
      } else {
        return utils.failRes(res)
      }
    })
  })
})

// 获取订单列表
router.get('/get_order_list', function(req, res, next) {
  var { loginCode, phone } = req.query

  if (!loginCode || !phone) {
    return utils.failRes(res, {
      msg: '参数有误'
    })
  }

  services.getOpenId(loginCode).then(result => {
    var { openid } = result

    if (!openid) {
      return utils.failRes(res, {
        msg: '获取订单列表失败'
      })
    }

    new Model('query_order_list').operate([openid, phone]).then(result => {
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

module.exports = router;