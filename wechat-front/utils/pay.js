function wxpay(app, money, orderId, redirectUrl) {
  wx.request({
    url: 'https://api.it120.cc/' + app.globalData.subDomain + '/pay/wxapp/get-pay-data',
    method:'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: {
      do: 'order',
      concrete: 'payOrder',
      userId: 1,
      money: money
    },
    success: function (res) {
      if (res.data.code == 0) {
        // 发起支付
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          nonceStr: res.data.data.nonceStr,
          package: 'prepay_id=' + res.data.data.prepayId,
          signType: 'MD5',
          paySign: res.data.data.sign,
          fail: function (aaa) {
            wx.showToast({ title: '支付失败:' + aaa })
          },
          success: function () {
            wx.showToast({ title: '支付成功' })
            wx.reLaunch({
              url: redirectUrl
            });
          }
        })
      } else {
        wx.showToast({ title: '服务器忙' + res.data.code + res.data.msg })
      }
    }
  })
}

module.exports = {
  wxpay: wxpay
}
