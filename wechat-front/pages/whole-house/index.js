import { getOrderTypeInfo, pay, login }  from '../../api/index.js'
import { SERVICENUMBER, APPID, PAYKEY, TIMEPICKERVALUE } from '../../config.js'
import { getCurrentDate } from '../../utils/util.js'
import { wxPay } from '../../utils/pay.js'
var app = getApp()

Page({
  data: {
    // 选项信息
    typeNameArray: [],
    // 选项id
    typeIdArray: [],
    priceList: [0],
    selectedIndex: 0,
    coupons: 0,
    // 折后价
    discountMoney: 0,
    // 会员折扣率
    memberScale: 0,
    multiArray: TIMEPICKERVALUE,
    multiIndex: [0, 8, 9],
    date: getCurrentDate().join('-'),
    addressName: ''
  },
  onLoad () {
    let { coupons, selectedIndex } = this.data
    let typeNameArray = [], typeIdArray = [], priceList = []
    const $that = this
    const { userInfo = {} } = app.globalData
    const memberScale = userInfo && userInfo.memberTypeInfo && userInfo.memberTypeInfo.memberScale || 0

    memberScale && this.setData({
      memberScale
    })

    getOrderTypeInfo({
      method: 'GET',
      query: {
        orderType: 1
      },
      success: res => {
        const { data } = res
        const { data: list = [], success } = data
        if (!success) { return }
        let discountMoney = 0

        list.map(item => {
          typeNameArray.push(item.type_name)
          typeIdArray.push(item.id)
          priceList.push(item.type_price)
        })

        discountMoney = (priceList[selectedIndex] * memberScale + coupons).toFixed(2)

        $that.setData({
          typeIdArray,
          typeNameArray, priceList: priceList.length ? priceList : [0],
          discountMoney: !isNaN(discountMoney) ? discountMoney : 0
        })
      },
      fail: err => {
        console.log(err)
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
  // 修改房屋面积
  bindPickerChange: function (e) {
    const selectedIndex = e.detail.value
    const { priceList, coupons } = this.data
    const { userInfo = {} } = app.globalData
    const memberScale = userInfo.memberTypeInfo && userInfo.memberTypeInfo.memberScale || 0
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
  payMoney: function () {
    // 获取订单信息
    const { priceList, selectedIndex, typeIdArray, date, multiArray, multiIndex, discountMoney } = this.data

    // 总价
    const totalFee = priceList[selectedIndex] - discountMoney 
    // 订单类型信息id
    const orderTypeId = typeIdArray[selectedIndex]
    // 订单创建时间
    const createTime = new Date().getTime()
    // 地址信息
    const { choosedAddress } = app.globalData
    // 预约时间
    const orderTime = `${date} ${multiArray[0][multiIndex[0]]}${multiArray[1][multiIndex[1]]}-${multiArray[2][multiIndex[2]]}点`

    // 预约时间校验
    const formatTime = `${date} ${multiArray[1][multiIndex[1]]}:00:00`
    if (new Date(formatTime).getTime() < createTime) {
      console.log('选择正确的时间')
    }

    // 未选择服务地址
    if (!choosedAddress) {
      wx.navigateTo({
        url: '/pages/address-list/index?type=choose'
      })
      return 
    }

    const orderType = '1-1'
    const orderId = `${orderType}-${getCurrentDate().join('')}${createTime}`

    wxPay(orderId, 0.01, '/pages/index/index')
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: SERVICENUMBER
    })
  }
})
