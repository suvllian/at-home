import { getOrderTypeInfo, login } from '../../api/index.js'
import { SERVICENUMBER, TIMEPICKERVALUE, MAXCOUNT, MINCOUNT, STORAGEKEY } from '../../config.js'
import { getCurrentDate, showToast } from '../../utils/util.js'
import { getEligibleCoupon, getMemberScale } from '../../utils/storage.js'
import { wxPay } from '../../utils/pay.js'

const pickArray = ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十']
const typeObject = {
  '1': 'sofaCount',
  '2': 'carpetCount',
  '3': 'floorCount',
  '4': 'cleanCount'
}
const priceObject = {
  '沙发': 'sofaPrice',
  '地毯': 'carpetPrice',
  '地板': 'floorPrice',
  '除螨': 'cleanPrice'
}
const app = getApp()

Page({
  data: {
    // 浮层是否隐藏
    hideSelectPopup: true,
    // 家居数量
    sofaCount: 1,
    carpetCount: 0,
    floorCount: 0,
    cleanCount: 0,
    // 家居价格
    sofaPrice: 0,
    carpetPrice: 0,
    floorPrice: 0,
    cleanPrice: 0,
    // 总价格
    totalFee: 0,
    // 数量限制
    minCount: MINCOUNT,
    maxCount: MAXCOUNT,
    // 券
    coupons: 0,
    // 会员折扣
    memberScale: 0,
    // 显示文字
    showText: '',
    // 预约时间及日期
    multiArray: TIMEPICKERVALUE,
    multiIndex: [0, 8, 9],
    date: getCurrentDate().join('-'),
    // 选中地址
    addressName: '',
    //
    typeId: 0
  },
  onShow: function () {
    this.setNumber()

    const { sofaCount } = this.data
    const $that = this
    const { choosedAddress = {} } = app.globalData
    const memberScale = getMemberScale()
    memberScale && this.setData({
      memberScale
    })

    if (choosedAddress.addressName) {
      this.setData({
        addressName: choosedAddress.addressName
      })
    }

    getOrderTypeInfo({
      query: {
        orderType: 6
      },
      success: res => {
        const { data } = res
        const { data: list = [] } = data
        let newPriceObject = {}
        let typeId = list[0].id

        list.forEach(item => {
          newPriceObject[priceObject[item.type_name]] = item.type_price
        })

        const totalFee = sofaCount * newPriceObject['sofaPrice']
        const coupons = getEligibleCoupon(totalFee)
        const discountMoney = (totalFee * memberScale + coupons).toFixed(2)

        $that.setData({
          ...newPriceObject, 
          totalFee, typeId, coupons,
          discountMoney: !isNaN(discountMoney) ? discountMoney : 0
        })
      }
    })
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
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  togglePopup: function() {
    var isHide = this.data.hideSelectPopup
    this.setData({
      hideSelectPopup: !isHide
    })
  },
  // 减少
  decreaseCount: function(e) {
    const { electricType } = e.target && e.target.dataset
    const { minCount } = this.data
    const currentCount = this.data[typeObject[electricType]]

    if (currentCount > minCount) {
      const data = {}
      data[typeObject[electricType]] = currentCount - 1
      this.setData(data)
    }
  },
  // 增加
  increaseCount: function (e) {
    const { electricType } = e.target && e.target.dataset
    const { maxCount } = this.data
    const currentCount = this.data[typeObject[electricType]]

    if (currentCount < maxCount) {
      const data = {}
      data[typeObject[electricType]] = currentCount + 1
      this.setData(data)
    }
  },
  setNumber: function () {
    const { sofaCount, carpetCount, floorCount, cleanCount, memberScale,
      sofaPrice, carpetPrice, floorPrice, cleanPrice }  = this.data

    const totalFee = sofaCount * sofaPrice +
      carpetCount * carpetPrice +
      floorCount * floorPrice +
      cleanCount * cleanPrice
    const coupons = getEligibleCoupon(totalFee)
    const discountMoney = (totalFee * memberScale + coupons).toFixed(2)
    let showText = []

    if (sofaCount) {
      showText.push(`沙发${pickArray[sofaCount - 1]}个`)
    } 
    if (carpetCount) {
      showText.push(`地毯${pickArray[carpetCount - 1]}间`)
    } 
    if (floorCount) {
      showText.push(`地板${pickArray[floorCount - 1]}间`)
    }
    if (cleanCount) {
      showText.push(`除螨${pickArray[cleanCount - 1]}次`)
    }

    let showTextString = showText.join('、')

    this.setData({
      totalFee, discountMoney, coupons,
      showText: showTextString.length > 8 ? showTextString.substring(0, 9) + '...' : showTextString
    })
  },
  submitNumber: function () {
    this.togglePopup()
    this.setNumber()
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: serviceNumber
    })
  },
  // 支付
  payMoney: function () {
    // 获取订单信息
    let { date, multiArray, multiIndex, totalFee, coupons, memberScale, typeId, sofaCount, carpetCount, floorCount, cleanCount } = this.data
    totalFee = totalFee * (1 - memberScale) - coupons

    if (!sofaCount && !carpetCount && !floorCount && !cleanCount) {
      showToast('至少选择一项家居！')
      return
    }

    const orderParentType = 6, orderTypeId = typeId
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
      specificCount: [sofaCount, carpetCount, floorCount, cleanCount]
    })
  }
 })
