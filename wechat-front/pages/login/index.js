import { register, getCode } from '../../api/index.js'
import { STORAGEKEY } from '../../config.js'
import { showToast } from '../../utils/util.js'
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber: '',
    verifyCode: '',
    text: '获取验证码',
    buttonInvalid: false
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
    const { phoneNumber, buttonInvalid = false } = this.data
    let timeCount = 60

    if (phoneNumber) {
      if (buttonInvalid) {
        showToast(`请${timeCount}秒后再试`)
      } else {
        const timeHandle = setInterval(() => {
          timeCount--
          this.setData({
            text: `${timeCount}S`,
            buttonInvalid: true
          })
        }, 1000)
        setTimeout(() => {
          clearInterval(timeHandle)
          this.setData({
            text: '获取验证码',
            buttonInvalid: false
          })
        }, 60000)

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
                console.log('获取验证码成功')
              },
              fail: err => {
                showToast('获取验证码失败')
              }
            })
          }
        })
      }
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

    if (!phoneNumber || !verifyCode) {
      showToast('请输入正确的手机号和验证码')
      return
    }

    wx.getStorage({
      key: STORAGEKEY,
      success: res => {
        const { data: userInfo } = res || {}

        wx.login({
          success: function (res) {
            const { code } = res

            if (code) {
              wx.showLoading()
              register({
                method: 'POST',
                data: {
                  phoneNumber,
                  verifyCode,
                  nickName: userInfo.nickName,
                  loginCode: code
                },
                success: res => {
                  const { success = false, msg = '', data } = res.data
                  wx.hideLoading()
                  if (!success) {
                    showToast(msg)
                    return
                  }

                  wx.setStorage({
                    key: STORAGEKEY,
                    data: {
                      ...userInfo,
                      ...data
                    }
                  })
                  wx.navigateBack({
                    delta: 1
                  })
                },
                fail: err => {
                  wx.hideLoading()
                  showToast('登录失败，请重试')
                }
              })
            }
          }
        })
      }
    })
  }
})