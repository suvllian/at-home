import { SERVICENUMBER, STORAGEKEY } from '../../config.js'
const app = getApp()

Page({
  data: {
    userInfo: {}
  },
  onLoad: function() {
    const $that = this

    wx.getStorage({
      key: STORAGEKEY,
      success: res => {
        const { data: userInfo } = res || {}
        const { phone } = userInfo || {}

        if (!phone) {
          // 未注册|未登录
          wx.redirectTo({
            url: '/pages/login/index'
          })
        }

        $that.setData({
          userInfo
        })
      },
      fail: err => {
        wx.redirectTo({
          url: '/pages/login/index'
        })
      }
    })
  },
  loginOut: function() {
    app.globalData.choosedAddress = {}
    wx.removeStorage({
      key: STORAGEKEY,
      success: res => {
        console.log('退出成功')
      },
      fail: err => {
        console.log('退出失败')
      }
    })

    wx.navigateBack({
      delta: 1
    })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: SERVICENUMBER
    })
  }
})
