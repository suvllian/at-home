import { getAddress } from '../../api/index.js'
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    handleType: 'view',
    addressList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      handleType: options.type
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const $that = this

    wx.login({
      success: res => {
        const { code } = res
        // 发送请求，获取地址
        if (code) {
          getAddress({
            query: {
              loginCode: code
            },
            success: function (res) {
              const { data = {} } = res
              const { data: addressList = [] }  = data

              addressList.forEach(address => {
                address.isMale = address.is_male == "1" ? true : false
                address.specificAddress = address.specific_address
              })

              $that.setData({
                addressList
              })
            },
            fail: function () {

            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },
  clickAddress: function(e) {
    const { handleType, addressList } = this.data
    if (handleType === 'choose') {
      const { addressId } = e.currentTarget.dataset
      const choosedAddress = addressList.filter(address => address.id === addressId) || []

      let addressName = choosedAddress[0].area + choosedAddress[0].specificAddress
      if (addressName.length > 8) {
        addressName = `${addressName.substring(0, 8)}...`
      }
      app.globalData.choosedAddress = {
        addressId,
        addressName
      }
      
      wx.navigateBack({
        delta: 1
      })
    }
  }
})