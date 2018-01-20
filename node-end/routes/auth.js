var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var UUId = require('uuid');
// 解析XML
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true});
var xmlBuilder = new xml2js.Builder();
var utils = require('./../utils/index.js');
var Model = require('./../models/model');
var config = require('./../config/index.js');
var services = require('./../services/index');
// 腾讯云短信
var QcloudSms = require('qcloudsms_js');
var qcloudsms = QcloudSms(config.SMSAPPID, config.SMSAPPKEY);
var smsSender = qcloudsms.SmsSingleSender();

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

module.exports = router;