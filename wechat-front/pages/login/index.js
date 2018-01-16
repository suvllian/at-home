import { register, getCode } from '../../api/index.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber: '',
    verifyCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  /**
   * 输入手机号
   */
  phoneInput: function (e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },
  /**
   * 获取验证码
   */
  getCode: function () {
    const { phoneNumber } = this.data

    if (phoneNumber) {
      wx.login({
        success: res => {
          const { code } = res

          getCode({
            method: 'POST',
            data: {
              phoneNumber,
              loginCode: code
            },
            success: res => {
              console.log(res)
            },
            fail: err => {
              console.log(err)
            }
          })
        }
      })
    }

    
  },
  /**
   * 输入验证码
   */
  codeInput: function (e) {
    this.setData({
      verifyCode: e.detail.value
    })
  },
  /**
   * 点击下一步：注册
   */
  register: function() {
    const { phoneNumber, verifyCode } = this.data
    const { userInfo = {} } = app.globalData

    if (phoneNumber && verifyCode) {
      wx.login({
        success: function(res) {
          const { code } = res

          if (code) {
            register({
              method: 'POST',
              data: {
                phoneNumber,
                verifyCode,
                nickName: userInfo.nickName,
                loginCode: code
              },
              success: res => {
                const { success = false, msg = '', noRegister = false } = res.data
                const { userInfo } = app.globalData

                if (success) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
        }
      })
    }
  }
})