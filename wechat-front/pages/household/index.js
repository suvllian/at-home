import { getOrderTypeInfo, login } from '../../api/index.js'
import { serviceNumber } from '../../config.js'
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

    const { coupons, sofaCount } = this.data
    const $that = this
    const { userInfo = {} } = app.globalData
    const memberScale = userInfo && userInfo.memberTypeInfo && userInfo.memberTypeInfo.memberScale || 0

    memberScale && this.setData({
      memberScale
    })

    getOrderTypeInfo({
      query: {
        orderType: 6
      },
      success: res => {
        const { data } = res
        const { data: list = [] } = data
        let discountMoney = 0, totalFee = 0

        let newPriceObject = {}

        list.forEach(item => {
          newPriceObject[priceObject[item.type_name]] = item.type_price
        })

        totalFee = sofaCount * newPriceObject['sofaPrice']
        discountMoney = (totalFee * memberScale + coupons).toFixed(2)

        $that.setData({
          ...newPriceObject, totalFee,
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
    const { coupons, sofaCount, carpetCount, floorCount, cleanCount, memberScale,
      sofaPrice, carpetPrice, floorPrice, cleanPrice }  = this.data

    const totalFee = sofaCount * sofaPrice +
      carpetCount * carpetPrice +
      floorCount * floorPrice +
      cleanCount * cleanPrice
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
