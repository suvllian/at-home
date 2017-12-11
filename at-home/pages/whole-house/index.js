Page({
  data: {
    areaArray: ['100㎡—135㎡', '136㎡—180㎡', '100㎡以上'],
    areaIndex: 0,
    time: ''
  },
  bindPickerChange: function (e) {
    this.setData({
      areaIndex: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  }
})
