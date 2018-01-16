import { getOrderList } from '../../api/index.js'
import { serviceNumber } from '../../config.js'

Page({
  data: {
    orderList: []
  },
  onShow: function() {
    const $that = this

    // 发送请求，获取地址
    getOrderList({
      query: {
        userId: 1
      },
      success: function (res) {
        $that.setData({
          orderList: res.data
        })
      },
      fail: function () {

      }
    })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: serviceNumber
    })
  }
})
