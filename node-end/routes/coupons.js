var express = require('express');
var router = express.Router();
var utils = require('./../utils/index.js');
var Model = require('./../models/model');
var services = require('./../services/index');

// 获取券列表
router.get('/get_coupons_list', function(req, res, next) {
  var { phone, code: loginCode } = req.query

  if (!phone || !loginCode) {
    return utils.failRes(res, {
      msg: '获取券列表请求参数有误'
    })
  }

  services.getOpenId(loginCode).then(loginResult => {
    var { openid: openId } = loginResult

    if (!openId) {
      return utils.failRes(res, {
        msg: '登录失败'
      })
    }

    new Model('query_userid_by_openid').operate([openId, phone]).then(getUserIdResult => {
      if (!getUserIdResult || !getUserIdResult.length) {
        return utils.failRes(res, {
          noRegister: true,
          msg: '未注册'
        })
      }

      var { id: userId } = getUserIdResult[0] || {}

      new Model('query_coupon_list').operate([userId]).then(getCouponListResult => {
        return utils.successRes(res, {
          data: getCouponListResult
        })
      }).catch(error => {
        console.log('获取券列表失败', error)
        return utils.failRes(res, {
          msg: '获取券列表失败'
        })
      })
    }).catch(error => {
      console.log('查询用户信息失败', error)
      return utils.failRes(res, {
        msg: '查询用户身份失败'
      })
    })
  })
})

// 兑换抵用券
router.post('/exchange_sent_coupon', function(req, res, next) {
  var { code: loginCode, phone, couponCode } = req.body
  var currentTime = new Date().getTime()

  if (!loginCode || !phone || !couponCode) {
    return utils.failRes(res, {
      msg: '兑换抵用券请求参数有误'
    })
  }

  services.getOpenId(loginCode).then(result => {
    var { openid: openId, session_key } = result

    if (!openId) {
      return utils.failRes(res, {
        msg: '登录失败'
      })
    }

    new Model('query_userid_by_openid').operate([openId, phone]).then(isRegisterResult => {
      if (!isRegisterResult || !isRegisterResult.length) {
        return utils.failRes(res, {
          noRegister: true,
          msg: '登录失败'
        })
      }
      
      new Model('query_sent_coupon').operate([couponCode]).then(isHasSentCoupon => {
        if (!isHasSentCoupon || !isHasSentCoupon.length) {
          return utils.failRes(res, {
            msg: '无效抵用券凭证码'
          })
        } 

        var { id: sentCouponId } = isHasSentCoupon[0] || {}
        var { id: userId } = isRegisterResult[0] || {}
        console.log(isRegisterResult, sentCouponId)

        new Model('update_sent_coupon').operate([userId, currentTime, sentCouponId]).then(finalResult => {
          console.log(finalResult)
          if (!finalResult || !finalResult.length) {
            return utils.successRes(res, {
              msg: '领用成功'
            })
          } 

          return utils.failRes(res, {
            msg: '领用失败'
          })
        }).catch(error => {
          return utils.failRes(res, {
            msg: '领用失败'
          })
        })
      }).catch(error => {
        console.log(error)
        return utils.failRes(res)
      })
    }).catch(error => {
      console.log(error)
      return utils.failRes(res)
    })
  })
})

module.exports = router;