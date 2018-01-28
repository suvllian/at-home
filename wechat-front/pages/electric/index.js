import { getOrderTypeInfo, login } from '../../api/index.js'
import { SERVICENUMBER, TIMEPICKERVALUE, MAXCOUNT, MINCOUNT } from '../../config.js'
import { getEligibleCoupon, getMemberScale, clearCouponInfo } from '../../utils/storage.js'
import { getCurrentDate, showToast } from '../../utils/util.js'
import { wxPay } from '../../utils/pay.js'

const pickArray = ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十']
const typeObject = {
  '1': 'hangAirConditionCount',
  '2': 'packageAirConditionCount',
  '3': 'kitchenVentilatorCount',
  '4': 'washerCount',
  '5': 'computerCount',
  '6': 'microwaveCount',
  '7': 'singleRefrigeratorCount',
  '8': 'complexRefrigeratorCount',
}
const priceObject = {
  '挂式空调': 'hangAirConditionPrice',
  '柜式空调': 'packageAirConditionPrice',
  '油烟机': 'kitchenVentilatorPrice',
  '洗衣机': 'washerPrice',
  '电脑': 'computerPrice',
  '微波炉': 'microwavePrice',
  '单开门冰箱': 'singleRefrigeratorPrice',
  '双开门冰箱': 'complexRefrigeratorPrice'
}
const app = getApp()

Page({
  data: {
    hideSelectPopup: true,

    // 电器数量
    hangAirConditionCount: 1,
    packageAirConditionCount: 0,
    kitchenVentilatorCount: 0,
    washerCount: 0,
    computerCount: 0,
    microwaveCount: 0,
    singleRefrigeratorCount: 0,
    complexRefrigeratorCount: 0,

    // 电器价格
    hangAirConditionPrice: 0,
    packageAirConditionPrice: 0,
    kitchenVentilatorPrice: 0,
    washerPrice: 0,
    computerPrice: 0,
    microwavePrice: 0,
    singleRefrigeratorPrice: 0,
    complexRefrigeratorPrice: 0,

    // 总价
    totalFee: 0,
    // 显示文字
    showText: '',
    // 数量限制
    minCount: MINCOUNT,
    maxCount: MAXCOUNT,
    // 时间日期选择
    multiArray: TIMEPICKERVALUE,
    multiIndex: [0, 8, 9],
    date: getCurrentDate().join('-'),
    // 地址信息
    addressName: '',
    // 会员折扣
    memberScale: 0,
    coupons: 0,
    //
    typeId: 0,
  },
  onShow: function () {
    this.setNumber()

    const { coupons, hangAirConditionCount } = this.data
    const $that = this
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
        orderType: 5
      },
      success: res => {
        const { data } = res
        const { data: list = [] } = data
        let newPriceObject = {}
        let typeId = list[0].id

        list.forEach(item => {
          newPriceObject[priceObject[item.type_name]] = item.type_price
        })

        const totalFee = hangAirConditionCount * newPriceObject['hangAirConditionPrice']
        const coupons = getEligibleCoupon(totalFee)
        const discountMoney = (totalFee * memberScale + coupons).toFixed(2)
        // 关闭loading
        wx.hideLoading()

        $that.setData({
          ...newPriceObject,
          totalFee, typeId, coupons,
          discountMoney: !isNaN(discountMoney) ? discountMoney : 0
        })
      },
      fail: err => {
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
    this.setData({
      areaIndex: e.detail.value
    })
  },
  // 修改预约时间
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  // 修改预约日期
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  // 关闭浮层
  togglePopup: function() {
    var isHide = this.data.hideSelectPopup
    this.setData({
      hideSelectPopup: !isHide
    })
  },
  // 减少
  decreaseCount: function(e) {
    const { electricType } = e.target && e.target.dataset
    const currentCount = this.data[typeObject[electricType]]

    if (currentCount > MINCOUNT) {
      const data = {}
      data[typeObject[electricType]] = currentCount - 1
      this.setData(data)
    }
  },
  // 增加
  increaseCount: function (e) {
    const { electricType } = e.target && e.target.dataset
    const currentCount = this.data[typeObject[electricType]]

    if (currentCount < MAXCOUNT) {
      const data = {}
      data[typeObject[electricType]] = currentCount + 1
      this.setData(data)
    }
  },
  setNumber: function () {
    const { hangAirConditionCount, packageAirConditionCount, kitchenVentilatorCount, washerCount,
      computerCount, microwaveCount, singleRefrigeratorCount, complexRefrigeratorCount, 
      hangAirConditionPrice, packageAirConditionPrice, kitchenVentilatorPrice, washerPrice, computerPrice, microwavePrice, 
      singleRefrigeratorPrice, complexRefrigeratorPrice, 
      memberScale }  = this.data

    const totalFee = hangAirConditionCount * hangAirConditionPrice + 
      packageAirConditionCount * packageAirConditionPrice + 
      kitchenVentilatorCount * kitchenVentilatorPrice + 
      washerCount * washerPrice + 
      computerCount * computerPrice + 
      microwaveCount * microwavePrice + 
      singleRefrigeratorCount * singleRefrigeratorPrice +
      complexRefrigeratorCount * complexRefrigeratorPrice
    const coupons = getEligibleCoupon(totalFee)
    const discountMoney = (totalFee * memberScale + coupons).toFixed(2)
    let showText = []

    if (hangAirConditionCount) {
      showText.push(`挂式空调${pickArray[hangAirConditionCount - 1]}个`)
    } 
    if (packageAirConditionCount) {
      showText.push(`柜式空调${pickArray[packageAirConditionCount - 1]}个`)
    } 
    if (kitchenVentilatorCount) {
      showText.push(`油烟机${pickArray[kitchenVentilatorCount - 1]}个`)
    }
    if (washerCount) {
      showText.push(`洗衣机${pickArray[washerCount - 1]}个`)
    }
    if (computerCount) {
      showText.push(`电脑${pickArray[computerCount - 1]}台`)
    }
    if (microwaveCount) {
      showText.push(`微波炉${pickArray[microwaveCount - 1]}台`)
    }
    if (singleRefrigeratorCount) {
      showText.push(`单开门冰箱${pickArray[singleRefrigeratorCount - 1]}个`)
    }
    if (complexRefrigeratorCount) {
      showText.push(`双开门冰箱${pickArray[complexRefrigeratorCount - 1]}个`)
    }

    let showTextString = showText.join('、')

    this.setData({
      coupons, totalFee, discountMoney,
      showText: showTextString.length > 8 ? showTextString.substring(0, 9) + '...' : showTextString
    })
  },
  submitNumber: function () {
    this.togglePopup()
    this.setNumber()
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: SERVICENUMBER
    })
  },
  // 支付
  payMoney: function () {
    // 获取订单信息
    let { date, multiArray, multiIndex, totalFee, coupons, memberScale, typeId, hangAirConditionCount, packageAirConditionCount,    
      kitchenVentilatorCount, washerCount, computerCount, microwaveCount, singleRefrigeratorCount, 
      complexRefrigeratorCount } = this.data

    totalFee = totalFee * (1 - memberScale) - coupons

    if (!hangAirConditionCount && !packageAirConditionCount && !kitchenVentilatorCount && !washerCount && !computerCount && !microwaveCount && !singleRefrigeratorCount) {
      showToast('至少选择一项电器！')
      return 
    }

    const orderParentType = 5, orderTypeId = typeId
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
      createTime,
      specificCount: [hangAirConditionCount, packageAirConditionCount, kitchenVentilatorCount, washerCount,
        computerCount, microwaveCount, singleRefrigeratorCount, complexRefrigeratorCount]
    })
  }
 })
