import { serviceNumber } from '../../config.js'
const app = getApp()

Page({
  data: {
    userInfo: {}
  },
  onLoad: function() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: serviceNumber
    })
  }
})
