import { getAddress } from '../../api/index.js'
import { showToast } from '../../utils/util.js'
import { getUserPhone } from '../../utils/storage.js'
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const $that = this
    const phone = getUserPhone()

    if (!phone) {
      // 未注册
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return
    }

    wx.login({
      success: res => {
        const { code } = res

        if (!code) {
          showToast('获取用户信息失败')
          return 
        }
        // loading交互
        wx.showLoading()
        getAddress({
          method: 'GET',
          data: {
            phone,
            loginCode: code
          },
          success: function (res) {
            const { data = {} } = res
            const { data: addressList = [], success = false, msg = '', noRegister = false, noLogin = false } = data
            // 隐藏loading
            wx.hideLoading()

            // 登录失败
            if (!success) {
              if (noRegister || noLogin) {
                // 未注册
                wx.redirectTo({
                  url: '/pages/login/index'
                })
              } else {
                showToast(msg)
                return
              }
            }

            addressList.forEach(address => {
              address.isMale = address.is_male == "1" ? true : false
              address.specificAddress = address.specific_address
            })

            $that.setData({
              addressList
            })
          },
          fail: function () {
            // 隐藏loading
            wx.hideLoading()
            showToast('获取地址失败')
          }
        })
      }
    })
  },
  clickAddress: function(e) {
    const { handleType, addressList } = this.data
    if (handleType === 'choose') {
      const { addressId } = e.currentTarget.dataset
      const choosedAddress = addressList.filter(address => address.address_id === addressId) || []

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