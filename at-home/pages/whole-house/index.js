Page({
  data: {
    areaList: ['99㎡以下', '100㎡—135㎡', '136㎡—180㎡', '180㎡以上'],
    priceList: [100, 200, 300, 400],
    selectedIndex: 0,
    coupons: 0,
    memberScale: 0.1,
    discountMoney: 0,
    time: '00:00',
    multiArray: [['上午', '下午'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    multiIndex: [0, 8, 9],
    date: (new Date()).getFullYear() + '-' + (new Date()).getMonth() + '-' + (new Date()).getDate()
  },
  onLoad () {
    const { priceList, memberScale, coupons, selectedIndex } = this.data
    const discountMoney = (priceList[selectedIndex] * memberScale + coupons).toFixed(2)
    
    this.setData({
      discountMoney
    })
  },
  // 修改预约时间
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
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
