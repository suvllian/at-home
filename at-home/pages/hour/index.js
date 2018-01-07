Page({
  data: {
    durationArray: ['3小时', '4小时', '5小时', '6小时'],
    durationIndex: 0,
    time: '00:00',
    date: (new Date()).getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + (new Date()).getDate()
  },
  bindDurationChange: function (e) {
    this.setData({
      durationIndex: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: '15619216635'
    })
  }
})
