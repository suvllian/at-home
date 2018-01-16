import { getOrderTypeInfo, pay, login }  from '../../api/index.js'
var app = getApp()

Page({
  data: {
    typeNameArray: [],
    priceList: [0],
    selectedIndex: 0,
    coupons: 0,
    // 折后价
    discountMoney: 0,
    // 会员折扣率
    memberScale: 0,
    multiArray: [['上午', '下午'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    multiIndex: [0, 8, 9],
    date: (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate(),
    addressName: ''
  },
  onLoad () {
    let { coupons, selectedIndex } = this.data
    let typeNameArray = [], priceList = []
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
          priceList.push(item.type_price)
        })

        discountMoney = (priceList[selectedIndex] * memberScale + coupons).toFixed(2)

        $that.setData({
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
    wx.login({
      success: function(res) {
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

              // if (data && data.length) {
              //   app.globalData.userInfo = {
              //     ...userInfo,
              //     memberTypeInfo: {
              //       memberType: data[0].member_type,
              //       memberScale: 0.1
              //     }
              //   }
              // }
            }
          })
          // pay({
          //   method: 'POST',
          //   data: {
          //     orderId: new Date().getTime(),
          //     totalFee: 0.01,
          //     loginCode: code
          //   },
          //   success: function(res) {
          //     console.log(res)
          //   },
          //   fail: function(err) {
          //     console.log(err)
          //   }
          // })
        }
      }
    })
    // 传 订单号 金额 登录信息到后端
    

    // wx.requestPayment({
    //   timeStamp: `${new Date().getTime()}`,
    //   nonceStr: 'sadsadsadsadsadsad',
    //   package: 'prepay_id=*',
    //   signType: '',
    //   paySign: '',
    //   success: function () {
    //     console.log('success')
    //   }, 
    //   fail: function () {
    //     console.log('fail')
    //   }
    // })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: '15619216635'
    })
  }
})
