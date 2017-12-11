Page({
  data: {
    durationArray: ['3小时', '4小时', '5小时', '6小时'],
    durationIndex: 0,
    time: ''
  },
  bindDurationChange: function (e) {
    this.setData({
      durationIndex: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  }
})
