var app = getApp()

Page({
  data: {
    areaList: [],
    priceList: [],
    selectedIndex: 0,
    coupons: 0,
    memberScale: 0.1,
    discountMoney: 0,
    time: '00:00',
    multiArray: [['上午', '下午'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    multiIndex: [0, 8, 9],
    date: (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate(),
    addressName: ''
  },
  onLoad () {
    let { memberScale, coupons, selectedIndex } = this.data
    let areaList = [], priceList = []
    const $that = this

    wx.request({
      url: 'http://127.0.0.1/zaihu/index.php',
      data: {
        do: 'query',
        concrete: 'getOderTypeInfoList',
        orderType: 1
      },
      success: function(res) {
        const { data = {} } = res
        const { data: list = [] } = data

        list.map(item => {
          areaList.push(item.type_name)
          priceList.push(item.type_price)
        })
        $that.setData({
          areaList, priceList,
          discountMoney: (priceList[selectedIndex] * memberScale + coupons).toFixed(2)
        })
      },
      fail: function(res) {
        const areaList = ['99㎡以下', '100㎡—135㎡', '136㎡—180㎡', '180㎡以上']
        const priceList = [100, 200, 300, 400]
        
        $that.setData({
          areaList, priceList,
          discountMoney: (priceList[selectedIndex] * memberScale + coupons).toFixed(2)
        })
      }
    })
  },
  onShow: function () {
    const { choosedAddress = { } } = app.globalData

    if (choosedAddress.addressName) {
      this.setData({
        addressName: choosedAddress.addressName
      })
    }
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
  payMoney: function () {
    wx.requestPayment({
      timeStamp: `${new Date().getTime()}`,
      nonceStr: 'sadsadsadsadsadsad',
      package: 'prepay_id=*',
      signType: '',
      paySign: '',
      success: function () {
        console.log('success')
      }, 
      fail: function () {
        console.log('fail')
      }
    })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: '15619216635'
    })
  }
})
