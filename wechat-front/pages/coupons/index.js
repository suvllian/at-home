import { getOrderList } from '../../api/index.js'
import { serviceNumber } from '../../config.js'

Page({
  data: {
    couponsList: [{
      coupons_description: '兑换抵用券',
      coupons_money: 100,
      coupons_username: '亲爱的爸爸',
      used_time: '2017-11-25 09:36:10',
      has_used: 1
    }, {
      coupons_description: '兑换抵用券',
      coupons_money: 100,
      coupons_username: '亲爱的爸爸',
      used_time: '2017-11-25 09:36:10',
      has_used: 0
    }]
  },
  onLoad: function() {
    const $that = this

    // 发送请求，获取地址
    wx.login({
      success: res => {
        const { code } = res

        if (code) {
          getOrderList({
            query: {
              loginCode: code
            },
            success: function (res) {
              const { data = {} } = res
              const{ data: orderList } = data

              $that.setData({
                orderList
              })
            },
            fail: function (err) {
              console.log(err)
            }
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: serviceNumber
    })
  }
})
