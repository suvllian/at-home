import { getOrderTypeInfo } from '../../api/index.js'
import { serviceNumber } from '../../config.js'
const pickArray = ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十']
const app = getApp()

Page({
  data: {
    hideSelectPopup: true,
    kitchenCount: 1,
    kitchenPrice: 0,
    bathroomCount: 1,
    bathroomPrice: 0,
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

    let typeNameArray = [], priceList = []
    const { coupons, kitchenCount, bathroomCount } = this.data
    const $that = this
    const { userInfo = {} } = app.globalData
    const memberScale = userInfo && userInfo.memberTypeInfo && userInfo.memberTypeInfo.memberScale || 0

    memberScale && this.setData({
      memberScale
    })

    getOrderTypeInfo({
      query: {
        orderType: 4
      },
      success: res => {
        const { data } = res
        const { data: list = [] } = data
        let discountMoney = 0, totalFee = 0, kitchenPrice = 0, bathroomPrice = 0

        list.forEach(item => {
          if (item.type_name === '厨房') {
            kitchenPrice = item.type_price
          } else if (item.type_name === '卫生间') {
            bathroomPrice = item.type_price
          }
        })

        totalFee = bathroomCount * bathroomPrice + kitchenCount * kitchenPrice
        discountMoney = (totalFee * memberScale + coupons).toFixed(2)

        $that.setData({
          kitchenPrice, bathroomPrice, totalFee,
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
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: '15619216635'
    })
  },
  togglePopup: function() {
    var isHide = this.data.hideSelectPopup
    this.setData({
      hideSelectPopup: !isHide
    })
  },
  decreaseKitchen: function() {
    if (this.data.kitchenCount > this.data.minCount) {
      var currentCount = this.data.kitchenCount;
      currentCount--;
      this.setData({
        kitchenCount: currentCount
      })
    }
  },
  increaseKitchen: function () {
    if (this.data.kitchenCount < this.data.maxCount) {
      var currentCount = this.data.kitchenCount;
      currentCount++;
      this.setData({
        kitchenCount: currentCount
      })
    }
  },
  decreaseBathroom: function () {
    if (this.data.bathroomCount > this.data.minCount) {
      var currentCount = this.data.bathroomCount;
      currentCount--;
      this.setData({
        bathroomCount: currentCount
      })
    }
  },
  increaseBathroom: function () {
    if (this.data.bathroomCount < this.data.maxCount) {
      var currentCount = this.data.bathroomCount;
      currentCount++;
      this.setData({
        bathroomCount: currentCount
      })
    }
  },
  setNumber: function () {
    const { kitchenCount, kitchenPrice, bathroomCount, bathroomPrice, memberScale, coupons }  = this.data
    const totalFee = bathroomCount * bathroomPrice + kitchenCount * kitchenPrice
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
      showText, totalFee, discountMoney
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
              }

            }
          })
        }
      }
    })
  }
 })
