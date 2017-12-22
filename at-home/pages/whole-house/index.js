Page({
  data: {
    areaList: ['99㎡以下', '100㎡—135㎡', '136㎡—180㎡', '180㎡以上'],
    priceList: [100, 200, 300, 400],
    selectedIndex: 0,
    coupons: 0,
    memberScale: 0.1,
    discountMoney: 0,
    time: '00:00',
    date: (new Date()).getFullYear() + '-' + (new Date()).getMonth() + '-' + (new Date()).getDate()
  },
  onLoad () {
    const { priceList, memberScale, coupons, selectedIndex } = this.data
    const discountMoney = (priceList[selectedIndex] * memberScale + coupons).toFixed(2)
    
    this.setData({
      discountMoney
    })
  },
  bindPickerChange: function (e) {
    const selectedIndex = e.detail.value
    const { priceList, memberScale, coupons } = this.data
    const discountMoney = (priceList[selectedIndex] * memberScale + coupons).toFixed(2)

    this.setData({
      selectedIndex,
      discountMoney
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
