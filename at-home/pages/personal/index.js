var app = getApp()

Page({
  data: {
    userInfo: {}
  },
  onLoad: function() {
    var that = this
    wx.getUserInfo({
      success: function(res) {
        var userInfo = res.userInfo
        console.log(userInfo)
        that.setData({
          userInfo: userInfo
        })
      }
    })
  }
})
