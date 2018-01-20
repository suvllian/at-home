var express = require('express');
var router = express.Router();
var utils = require('./../utils/index.js');
var Model = require('./../models/model');
var services = require('./../services/index');

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