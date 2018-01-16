var express = require('express');
var request = require('request');
var crypto = require('crypto');
var mysql = require('mysql');
var UUId = require('uuid');
var router = express.Router();
var utils = require('./../utils/index.js');
var Model = require('./../models/model');
var config = require('./../config/index.js');
var services = require('./../services/index');
// 腾讯云短信
var QcloudSms = require('qcloudsms_js');
var qcloudsms = QcloudSms(config.SMSAPPID, config.SMSAPPKEY);
var smsSender = qcloudsms.SmsSingleSender();

router.get('/', function(req, res, next) {
  res.json({ author: 'suvllian'})
})

router.post('/pay_order', function(req, res, next) {
  var { orderId, loginCode, totalFee } = req.body

  services.getOpenId(loginCode).then(result => {
    var { openid } = result

    request.post({
      url: config.PAYURL,
      form: {
        appid: 'payload',
        mch_id: '',
        sub_appid: config.APPID,
        sub_mch_id: '',
        // 随机字符串
        nonce_str: UUId.v1(),
        sign: '',
        sign_type: 'MD5',
        body: '',
        out_trade_no: '',
        total_fee: totalFee * 100,
        // 终端ip
        spbill_create_ip: '',
        notify_url: '',
        trade_type: 'JSAPI',
        openid: openid
      }
    }, function(error, orderResult, data) {
      console.log(data)
    })
  })

  return utils.successRes(res)
})

// 登录
router.post('/login', function(req, res, next) {
  var { loginCode } = req.body

  services.getOpenId(loginCode).then(result => {
    var { openid: openId, session_key } = result

    if (!openId) {
      return utils.failRes(res, {
        msg: '登录失败'
      })
    }

    // 对session_key进行加密
    var sha1 = JSON.stringify(crypto.createHash('sha1').update(session_key).digest('hex'))

    new Model('query_user_is_register').operate([openId]).then(isRegisterResult => {
      if (!isRegisterResult || !isRegisterResult.length) {
        return utils.failRes(res, {
          noRegister: true,
          msg: '登录失败'
        })
      } else {
        return utils.successRes(res, {
          memberType: isRegisterResult && isRegisterResult[0].member_type,
          signature: sha1
        })
      }
    })
  })
})

// 获取验证码
router.post('/get_phone_code', function(req, res, next) {
  var { loginCode, phoneNumber } = req.body

  if (!phoneNumber) {
    return utils.failRes(res, {
      msg: '获取验证码失败，无法或许用户信息'
    })
  }

  // 验证一分钟内是否发过验证码
  var currentTime = new Date().getTime() - 60000
  new Model('query_has_sent_code').operate([currentTime, phoneNumber]).then(queryHasSentResult => {
    if (queryHasSentResult && queryHasSentResult.length) {
      return utils.failRes(res, {
        msg: '一分钟内只能获取一次验证码'
      })
    }

    services.getOpenId(loginCode).then(result => {
      var { openid } = result
      var verifyCode = utils.MathRand()
      var createTime = new Date().getTime()
      var invalidTime = createTime + config.SMSEFFECTIVETIME
  
      new Model('insert_verify_code').operate([createTime, invalidTime, verifyCode, openid, phoneNumber, 0]).then(result => {
        smsSender.sendWithParam('86', phoneNumber, config.SMSTEMPLETEID, [verifyCode], '', '', '', function(err, getSmsRes, resData) {
          var { result: isGetSmsSuccess } = resData
          console.log(resData, isGetSmsSuccess)
          if (isGetSmsSuccess !== 0) {
            return utils.failRes(res, {
              msg: '获取验证码失败'
            })
          } else {
            return utils.successRes(res)
          }
        })
      }).catch(error => {
        utils.failRes(res)
      })
    })
  })
})

// 注册
router.post('/register', function(req, res, next) {
  var { phoneNumber, verifyCode, loginCode, nickName = '' } = req.body

  if (!phoneNumber || !verifyCode || !loginCode || !nickName) {
    return utils.failRes(res, {
      msg: '注册失败，信息不完整'
    })
  }

  services.getOpenId(loginCode).then(openIdResult => {
    var { openid, session_key } = openIdResult

    if (!openid) {
      return utils.failRes(res, {
        msg: '注册失败，获取用户ID失败'
      })
    }

    var currentTime = new Date().getTime()

    new Model('query_verify_code').operate([currentTime, openid, phoneNumber]).then(queryVerifyCodeResult => {
      if (queryVerifyCodeResult && queryVerifyCodeResult.length) {
        var { verify_code: verifyCodeResult, id: verifyCodeId } = queryVerifyCodeResult[0]
        if (verifyCodeResult === verifyCode) {
          // 验证通过

          // 对session_key进行加密
          var sersionKeySha1 = JSON.stringify(crypto.createHash('sha1').update(session_key).digest('hex'))
          var openIdSha1 = JSON.stringify(crypto.createHash('sha1').update(openid).digest('hex'))

          new Model('update_verify_code_to_invalid').operate([verifyCodeId]).then(updateVerifyCodeResult => {
            new Model('insert_user').operate([nickName, openid, phoneNumber, 0]).then((result = {}) => {
              return result.insertId ? utils.successRes(res, {
                msg: '注册成功',
                signature: sersionKeySha1
              }) : utils.failRes(res, {
                msg: '注册失败，添加用户失败'
              })
            }).catch(error => {
              return utils.failRes(res, {
                msg: '注册失败，添加用户失败。'
              })
            })
          }).catch(error => {
            console.log(error)
          })
        } else {
          return utils.failRes(res, {
            msg: '无效验证码'
          })
        }
      } else {
        return utils.failRes(res, {
          msg: '无效验证码'
        })
      }
    }).catch(error => {
      console.log(error)
      return utils.failRes(res)
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
router.get('/get_order_list/:user_id', function(req, res, next) {
  var userId = req.params.user_id

  new Model('query_order_list').operate([userId]).then(result => {
    utils.responseJSON(res, result, 'get')
  })
})

// 获取地址
router.get('/get_address_list/:login_code', function(req, res, next) {
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
        msg: '获取地址失败'
      })
    }

    new Model('query_address').operate([openid]).then(result => {
      utils.successRes(res, {
        data: result
      })
    })
    .catch(error => {
      return utils.failRes(res, {
        msg: '查询地址失败'
      })
    })
  })
})

// 添加地址
router.post('/add_address', function(req, res, next) {
  var { name, isMale, phone, area, specificAddress, loginCode } = req.body 

  if (!loginCode || !name || !isMale || !phone || !area || !specificAddress) {
    return utils.failRes(res, {
      msg: '获取loginCode失败'
    })
  }

  services.getOpenId(loginCode).then(result => {
    var { openid } = result

    if (!openid) {
      return utils.failRes(res, {
        msg: '添加地址失败'
      })
    }

    new Model('query_userid_by_openid').operate([openid]).then(queryUserIdResult => {
      if (queryUserIdResult && queryUserIdResult.length) {
        var { id: userId } = queryUserIdResult[0]

        new Model('insert_address').operate([name, isMale, phone, area, specificAddress, userId]).then(result => {
          return utils.successRes(res)
        })
        .catch(error => {
          return utils.failRes(res, {
            msg: '添加地址失败'
          })
        })
      } else {
        return utils.failRes(res, {
          msg: '添加地址失败'
        })
      }
    })
    .catch(error => {
      console.log(error)
      return utils.failRes(res, {
        msg: '添加地址失败'
      })
    })
  })
  .catch(error => {
    console.log(error)
    return utils.failRes(res, {
      msg: '添加地址失败'
    })
  })
})

module.exports = router;
