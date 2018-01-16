import { getOrderTypeInfo } from '../../api/index.js'
import { serviceNumber } from '../../config.js'
var app = getApp()

Page({
  data: {
    // 选择类型
    typeNameArray: [],
    // 价格表
    priceList: [0],
    // 选中项
    selectedIndex: 0,
    // 折后价
    discountMoney: 0,
    // 会员折扣率
    memberScale: 0,
    // 抵金券
    coupons: 0,
    multiArray: [['上午', '下午'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    multiIndex: [0, 8, 9],
    date: (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate(),
    addressName: ''
  },
  onLoad: function () {
    let typeNameArray = [], priceList = []
    const { selectedIndex, coupons } = this.data
    const $that = this
    const { userInfo = {} } = app.globalData
    // 设置折扣比率
    const memberScale = userInfo && userInfo.memberTypeInfo && userInfo.memberTypeInfo.memberScale || 0

    memberScale && this.setData({
      memberScale
    })

    getOrderTypeInfo({
      query: {
        orderType: 3
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
          typeNameArray, priceList: priceList.length ? priceList : [0],
          discountMoney: !isNaN(discountMoney) ? discountMoney : 0.00
        })
      },
      fail: err => {
        this.setData({
          priceList: [0]
        })
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
  bindPickerChange: function (e) {
    this.setData({
      selectedIndex: e.detail.value
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
