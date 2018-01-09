const app = getApp()

Page({
  data: {
    userInfo: {}
  },
  onLoad: function() {
    this.setData({
      userInfo: app.globalData.userInfo
    })

    wx.login({
      success: function(res) {
        console.log('login success', res)
        wx.request({
          url: 'http://127.0.0.1/zaihu/index.php',
          data: {
            code: res.code
          }
        })
      },
      fail: function(err) {
        console.log('login fail', err)
      }
    })
  },
  onReady: function() {
    console.log('onReady')
  }
})
