Page({
  data: {
    userInfo: {}
  },
  onLoad: function() {aaa
    console.log('onLoad')

    wx.login({
      success: function(res) {
        console.log('login success', res)
        wx.request({
          url: 'http://127.0.0.1/1.php',
          data: {
            code: res.code
          }
        })
      },
      fail: function(err) {
        console.log('login fail', err)
      }
    })

    var that = this
    wx.getUserInfo({
      success: function(res) {
        var userInfo = res.userInfo
        that.setData({
          userInfo: userInfo
        })
      }
    })
  },
  onReady: function() {
    console.log('onReady')
  }
})
