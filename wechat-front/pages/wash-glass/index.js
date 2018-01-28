import { getOrderTypeInfo } from '../../api/index.js'
import { SERVICENUMBER, TIMEPICKERVALUE } from '../../config.js'
import { getCurrentDate, showToast } from '../../utils/util.js'
import { wxPay } from '../../utils/pay.js'
import { getEligibleCoupon, getMemberScale, clearCouponInfo } from '../../utils/storage.js'
var app = getApp()

Page({
  data: {
    // 选择类型
    typeNameArray: [],
    // 选择类型全部信息
    typeInformation: [],
    // 价格表
    priceList: [0],
    // 选中项
    selectedIndex: 0,
    // 折后价
    discountMoney: 0,
    // 会员折扣率
    memberScale: 0,
    // 折后价
    totalFee: 0,
    // 抵金券
    coupons: 0,
    multiArray: TIMEPICKERVALUE,
    multiIndex: [0, 8, 9],
    date: getCurrentDate().join('-'),
    addressName: ''
  },
  onShow: function () {
    const { selectedIndex } = this.data
    const $that = this
    let typeNameArray = [], priceList = []
    const { choosedAddress = {} } = app.globalData
    const memberScale = getMemberScale()
    memberScale && this.setData({
      memberScale
    })

    // 加载中
    wx.showLoading()

    if (choosedAddress.addressName) {
      this.setData({
        addressName: choosedAddress.addressName
      })
    }

    getOrderTypeInfo({
      query: {
        orderType: 3
      },
      success: res => {
        const { data } = res
        const { data: list = [] } = data

        list.map(item => {
          typeNameArray.push(item.type_name)
          priceList.push(item.type_price)
        })

        const totalFee = priceList[selectedIndex] * (1 - memberScale)
        const coupons = getEligibleCoupon(totalFee)
        const discountMoney = (priceList[selectedIndex] * memberScale + coupons).toFixed(2)
        // 关闭loading
        wx.hideLoading()

        $that.setData({
          coupons, totalFee,
          typeInformation: list,
          typeNameArray, priceList: priceList.length ? priceList : [0],
          discountMoney: !isNaN(discountMoney) ? discountMoney : 0.00
        })
      },
      fail: err => {
        this.setData({
          priceList: [0]
        })
        // 关闭loading
        wx.hideLoading()
        showToast('获取数据失败')
      }
    })
  },
  onUnload: function () {
    clearCouponInfo()
  },
  bindPickerChange: function (e) {
    const selectedIndex = e.detail.value
    const { priceList } = this.data
    const memberScale = getMemberScale()
    const totalFee = priceList[selectedIndex] * (1 - memberScale)
    const coupons = getEligibleCoupon(totalFee)
    const discountMoney = (priceList[selectedIndex] * memberScale + coupons).toFixed(2)

    this.setData({
      coupons, totalFee,
      selectedIndex,
      discountMoney
    })
  },
  // 修改预约时间
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
  // 联系客服
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: SERVICENUMBER
    })
  },
  // 支付
  payMoney: function () {
    // 获取订单信息
    const { priceList, selectedIndex, typeInformation, date, multiArray, multiIndex, discountMoney } = this.data
    // 总价
    const totalFee = priceList[selectedIndex] - discountMoney
    // 订单类型信息id
    const { id: orderTypeId, parent_type: orderParentType } = typeInformation[selectedIndex]
    // 订单创建时间
    const createTime = new Date().getTime()
    // 预约时间
    const orderTime = `${date} ${multiArray[0][multiIndex[0]]}${multiArray[1][multiIndex[1]]}-${multiArray[2][multiIndex[2]]}点`

    // 预约时间校验
    const formatTime = `${date} ${multiArray[1][multiIndex[1]]}:00:00`
    if (new Date(formatTime).getTime() < createTime) {
      console.log('选择正确的时间')
    }

    // 订单号
    const orderId = `1${orderParentType}${orderTypeId}${getCurrentDate().join('')}${createTime}`

    wxPay(orderId, totalFee, '/pages/index/index', {
      orderTypeId,
      orderParentType,
      orderTime,
      createTime
    })
  }
})
