Page({
  data: {
    areaArray: ['100㎡—135㎡', '136㎡—180㎡', '100㎡以上'],
    areaIndex: 0,
    time: '00:00',
    date: (new Date()).getFullYear() + '-' + (new Date()).getMonth() + '-' + (new Date()).getDate()
  },
  bindPickerChange: function (e) {
    this.setData({
      areaIndex: e.detail.value
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
