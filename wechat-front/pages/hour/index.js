import { getOrderTypeInfo } from '../../api/index.js'
import { serviceNumber } from '../../config.js'
var app = getApp()

Page({
  data: {
    typeNameArray: ['3小时', '4小时', '5小时', '6小时'],
    priceList: [0],
    selectedIndex: 0,
    // 折后价
    discountMoney: 0,
    // 会员折扣率
    memberScale: 0,
    coupons: 0,
    multiArray: [['上午', '下午'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    multiIndex: [0, 8, 9],
    date: (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate(),
    addressName: ''
  },
  onLoad: function() {
    let typeNameArray = [], priceList = []
    const { selectedIndex, coupons } = this.data
    const $that = this
    const { userInfo = {} } = app.globalData
    const memberScale = userInfo && userInfo.memberTypeInfo && userInfo.memberTypeInfo.memberScale || 0

    memberScale && this.setData({
      memberScale
    })

    getOrderTypeInfo({
      query: {
        orderType: 2
      },
      success: res => {
        const { data } = res
        const { data: list = [] } = data
        let discountMoney = 0

        list.map(item => {
          typeNameArray.push(item.type_name)
          priceList.push(item.type_price)
        })

        discountMoney = (priceList[selectedIndex] * memberScale + coupons).toFixed(2)

        $that.setData({
          typeNameArray, priceList: priceList.length ? priceList : [],
          discountMoney: !isNaN(discountMoney) ? discountMoney : 0
        })
      },
      fail: err => {
        
      }
    })
  },
  onShow: function () {
    const { choosedAddress = {} } = app.globalData

    if (choosedAddress.addressName) {
      this.setData({
        addressName: choosedAddress.addressName
      })
    }
  },
  bindDurationChange: function (e) {
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
  // 修改预约时间 start
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
  // 修改预约时间 end
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
