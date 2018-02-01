import { getOrderTypeInfo, login } from '../../api/index.js'
import { SERVICENUMBER, TIMEPICKERVALUE, MAXCOUNT, MINCOUNT } from '../../config.js'
import { getCurrentDate, showToast } from '../../utils/util.js'
import { getEligibleCoupon, getMemberScale, clearCouponInfo } from '../../utils/storage.js'
import { wxPay } from '../../utils/pay.js'

const app = getApp()
const orderTypeParentId = 4
const pickArray = ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十']
const typeObject = {
  '1': 'kitchenCount',
  '2': 'bathroomCount'
}
const priceObject = {
  '厨房': 'kitchenPrice',
  '卫生间': 'bathroomPrice'
}

Page({
  data: {
    // 浮层是否隐藏
    hideSelectPopup: true,
    // 数量
    kitchenCount: 1,
    bathroomCount: 1,
    // 价格
    kitchenPrice: 0,
    bathroomPrice: 0,
    // 总价
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

    let typeNameArray = [], priceList = []
    const { kitchenCount, bathroomCount } = this.data
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
        orderType: orderTypeParentId
      },
      success: res => {
        const { data } = res
        const { data: list = [] } = data
        let newPriceObject = {}
        let typeId = list[0].id

        list.forEach(item => {
          newPriceObject[priceObject[item.type_name]] = item.type_price
        })

        const totalFee = bathroomCount * newPriceObject['bathroomPrice'] + kitchenCount * newPriceObject['kitchenPrice']
        const coupons = getEligibleCoupon(totalFee)
        const discountMoney = (totalFee * memberScale + coupons).toFixed(2)
        // 关闭loading
        wx.hideLoading()

        $that.setData({
          ...newPriceObject, 
          typeId, coupons, totalFee,
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
  decreaseCount: function (e) {
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
    const { kitchenCount, kitchenPrice, bathroomCount, bathroomPrice, memberScale }  = this.data
    const totalFee = bathroomCount * bathroomPrice + kitchenCount * kitchenPrice
    const coupons = getEligibleCoupon(totalFee)
    const discountMoney = (totalFee * memberScale + coupons).toFixed(2)
    let showText = ''

    if (kitchenCount && bathroomCount) {
      showText = `厨房${pickArray[kitchenCount - 1]}间、卫生间${pickArray[bathroomCount - 1]}间`
    } else if (kitchenCount && !bathroomCount) {
      showText = `厨房${pickArray[kitchenCount - 1]}间`
    } else if (!kitchenCount && bathroomCount) {
      showText = `卫生间${pickArray[bathroomCount - 1]}间`
    }

    this.setData({
      coupons, showText, discountMoney, totalFee
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
    let { date, multiArray, multiIndex, totalFee, typeId, bathroomCount, kitchenCount, memberScale, coupons } = this.data
    totalFee = totalFee * (1 - memberScale) - coupons

    if (!bathroomCount && !kitchenCount) {
      showToast('厨房、卫生间至少选择一项！')
      return 
    }

    const orderParentType = 4, orderTypeId = typeId
    // 订单创建时间
    const createTime = new Date().getTime()
    // 预约时间
    const orderTime = `${date} ${multiArray[0][multiIndex[0]]}${multiArray[1][multiIndex[1]]}-${multiArray[2][multiIndex[2]]}点`

    // 预约时间校验
    const formatOrderTime = `${date} ${multiArray[1][multiIndex[1]]}:00:00`

    // 订单号
    const orderId = `1${orderParentType}${orderTypeId}${getCurrentDate().join('')}${createTime}`

    wxPay(orderId, totalFee, '/pages/history/index', {
      orderTypeId,
      orderParentType,
      orderTime,
      createTime,
      specificCount: [kitchenCount, bathroomCount]
    }, formatOrderTime)
  }
 })
