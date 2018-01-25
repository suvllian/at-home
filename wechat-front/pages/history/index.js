import { getOrderList } from '../../api/index.js'
import { SERVICENUMBER, STORAGEKEY } from '../../config.js'
import { formatTime } from '../../utils/util.js'
var app = getApp()

Page({
  data: {
    orderList: []
  },
  onLoad: function() {
    const $that = this
    const userInfo = wx.getStorageSync(STORAGEKEY) || {}
    const { phone } = userInfo || {}

    if (!phone) {
      // 未注册
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return
    }

    // 发送请求，获取地址
    wx.login({
      success: res => {
        const { code } = res

        if (code) {
          getOrderList({
            method: 'GET',
            data: {
              phone,
              loginCode: code
            },
            success: function (res) {
              const { data = {} } = res
              const{ data: orderList } = data

              orderList.forEach(order => {
                order.gmt_create = formatTime(new Date(parseInt(order.gmt_create)))
              })

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
      phoneNumber: SERVICENUMBER
    })
  }
})
