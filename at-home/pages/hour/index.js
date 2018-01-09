var app = getApp()

Page({
  data: {
    durationArray: ['3小时', '4小时', '5小时', '6小时'],
    durationIndex: 0,
    multiArray: [['上午', '下午'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    multiIndex: [0, 8, 9],
    date: (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate(),
    addressName: ''
  },
  onShow: function () {
    const { choosedAddress = {} } = app.globalData

    if (choosedAddress.addressName) {
      this.setData({
        addressName: choosedAddress.addressName
      })
    }
  },
  bindDurationChange: function (e) {
    this.setData({
      durationIndex: e.detail.value
    })
  },
  // 修改预约时间 start
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  // 修改预约时间 end
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: '15619216635'
    })
  }
})
