import { getOrderTypeInfo, login } from '../../api/index.js'
import { serviceNumber } from '../../config.js'
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

    totalFee: 0,
    minCount: 0,
    maxCount: 10,
    coupons: 0,
    memberScale: 0,
    showText: '',
    multiArray: [['上午', '下午'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    multiIndex: [0, 8, 9],
    date: (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate(),
    addressName: ''
  },
  onShow: function () {
    const { choosedAddress = {} } = app.globalData

    if (choosedAddress.addressName) {
      this.setData({
        addressName: choosedAddress.addressName
      })
    }
  },
  onLoad: function () {
    this.setNumber()

    const { coupons, hangAirConditionCount } = this.data
    const $that = this
    const { userInfo = {} } = app.globalData
    const memberScale = userInfo && userInfo.memberTypeInfo && userInfo.memberTypeInfo.memberScale || 0

    memberScale && this.setData({
      memberScale
    })

    getOrderTypeInfo({
      query: {
        orderType: 5
      },
      success: res => {
        const { data } = res
        const { data: list = [] } = data
        let discountMoney = 0, totalFee = 0
        let newPriceObject = {}

        list.forEach(item => {
          newPriceObject[priceObject[item.type_name]] = item.type_price
        })

        totalFee = hangAirConditionCount * newPriceObject['hangAirConditionPrice']
        discountMoney = (totalFee * memberScale + coupons).toFixed(2)

        $that.setData({
          ...newPriceObject,
          totalFee,
          discountMoney: !isNaN(discountMoney) ? discountMoney : 0
        })
      },
      fail: err => {

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
    const { hangAirConditionCount, packageAirConditionCount, kitchenVentilatorCount, washerCount,
      computerCount, microwaveCount, singleRefrigeratorCount, complexRefrigeratorCount, 
      hangAirConditionPrice, packageAirConditionPrice, kitchenVentilatorPrice, washerPrice, computerPrice, microwavePrice, 
      singleRefrigeratorPrice, complexRefrigeratorPrice, 
      memberScale, coupons }  = this.data

    const totalFee = hangAirConditionCount * hangAirConditionPrice + 
      packageAirConditionCount * packageAirConditionPrice + 
      kitchenVentilatorCount * kitchenVentilatorPrice + 
      washerCount * washerPrice + 
      computerCount * computerPrice + 
      microwaveCount * microwavePrice + 
      singleRefrigeratorCount * singleRefrigeratorPrice +
      complexRefrigeratorCount * complexRefrigeratorPrice
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
      totalFee, discountMoney,
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
    wx.login({
      success: function (res) {
        const { code } = res

        if (code) {
          login({
            method: 'POST',
            data: {
              loginCode: code
            },
            success: res => {
              const { success = false, msg = '', noRegister = false } = res.data
              const { userInfo } = app.globalData

              // 登录失败
              if (!success) {
                if (noRegister) {
                  // 未注册
                  wx.navigateTo({
                    url: '/pages/login/index'
                  })
                } else {
                  console.log(msg)
                  return
                }
              } else {
                wx.showToast({
                  title: '成功...'
                })
              }
            }
          })
        }
      }
    })
  }
 })
