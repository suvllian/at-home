var express = require('express');
var router = express.Router();
var utils = require('./../utils/index.js');
var Model = require('./../models/model');
var services = require('./../services/index');

// 获取用户列表
router.get('/get_user_list', function(req, res, next) {
  // 鉴权

  new Model('query_user_list').operate().then(result => {
    return utils.successRes(res, {
      data: result
    })
  }).catch(err => {
    return utils.failRes(res)
  })
})

// 获取用户列表
router.get('/get_user_infor', function(req, res, next) {
  // 鉴权

  const { id: userId = 0 } = req.query
  if (!userId || isNaN(parseInt(userId))) {
    return utils.failRes(res, {
      msg: '请求参数有误'
    })
  }

  new Model('query_user_infor_byid_admin').operate([userId]).then(basicInformation => {
    if (!basicInformation || !basicInformation.length) {
      return utils.failRes(res, {
        msg: '查询用户信息失败'
      })
    }

    new Model('query_user_order_byid_admin').operate([userId]).then(orderInformation => {
      if (!orderInformation) {
        return utils.failRes(res, {
          msg: '查询订单信息失败'
        })
      }

      new Model('query_coupon_list_admin').operate([userId]).then(couponsInformation => {
        if (!couponsInformation) {
          return utils.failRes(res, {
            msg: '查询券信息失败'
          })
        }

        new Model('query_user_address_byid_admin').operate([userId]).then(addressInformation => {
          if (!addressInformation) {
            return utils.failRes(res, {
              msg: '查询地址信息失败'
            })
          }

          return utils.successRes(res, {
            data: {
              basicInformation,
              orderInformation,
              couponsInformation,
              addressInformation
            }
          })
        }).catch(err => {
          console.log(err)
          return utils.failRes(res)
        })
      }).catch(err => {
        console.log(err)
        return utils.failRes(res)
      })
      
    }).catch(err => {
      console.log(err)
      return utils.failRes(res)
    })
  }).catch(err => {
    console.log(err)
    return utils.failRes(res)
  })
})

// 获取抵用券列表
router.get('/get_all_order_list', function(req, res, next) {
  // 鉴权

  new Model('query_all_order_list_admin').operate().then(result => {
    return utils.successRes(res, {
      data: result
    })
  }).catch(err => {
    return utils.failRes(res)
  })
})

// 获取订单类型信息列表
router.get('/get_type_infor_list', function(req, res, next) {
  // 鉴权

  let { orderParentType } = req.query || {}
  let queryPromise = {}

  if (isNaN(parseInt(orderParentType))) {
    queryPromise = new Model('query_all_order_type_infor_admin').operate()
  } else {
    queryPromise = new Model('query_order_type_infor_admin').operate([orderParentType])
  }
  
  queryPromise.then(result => {
    return utils.successRes(res, {
      data: result
    })
  }).catch(err => {
    console.log(err)
    return utils.failRes(res)
  })
})

router.post('/update_type_infor', function(req, res, next) {
  // 鉴权
  const { id = 0, newPrice = 0 } = req.body

  if (!id || !newPrice) {
    return utils.failRes(res, {
      msg: '请求参数有误'
    })
  }

  new Model('update_type_infor_admin').operate([newPrice, id]).then(result => {
    const { affectedRows = 0 } = result
    if (affectedRows) {
      return utils.successRes(res)
    } else {
      return utils.failRes(res)
    }
  }).catch(err => {
    return utils.failRes(res)
  })
})

// 获取抵用券列表
router.get('/get_all_coupons_list', function(req, res, next) {
  // 鉴权

  new Model('query_all_coupon_list_admin').operate().then(result => {
    return utils.successRes(res, {
      data: result
    })
  }).catch(err => {
    return utils.failRes(res)
  })
})

// 添加抵用券
router.post('/add_coupon', function(req, res, next) {
  // 鉴权
  const { couponCode, couponMoney, couponInvalidTime, couponType } = req.body
  if (!couponCode || !couponMoney || !couponInvalidTime || !couponType) {
    return utils.failRes(res, {
      msg: '请求参数有误'
    })
  }
  const createTime = new Date().getTime()

  new Model('insert_new_sent_coupon_admin').operate([couponCode, couponMoney, createTime, couponInvalidTime, couponType]).then(insertReuslt => {
    if (!insertReuslt) {
      return utils.failRes(res, {
        msg: '添加失败'
      })
    }
    console.log(insertReuslt)
    return utils.successRes(res)
  }).catch(error => {
    return utils.failRes(res, {
      msg: '添加失败'
    })
  })
})

module.exports = router;