import { exchangeCoupon, getCouponsList } from '../../api/index.js'
import { showToast, formatTime } from '../../utils/util.js'
import { SERVICENUMBER, STORAGEKEY } from '../../config.js'
const app = getApp()

Page({
  data: {
    couponsList: [],
    couponCode: '',
    handleType: '',
    totalFee: 0
  },
  onLoad: function (options) {
    this.getCouponsList()

    let { totalFee = 0 } = options
    totalFee = parseInt(totalFee)
    totalFee = isNaN(totalFee) ? 0 : totalFee
    this.setData({
      totalFee,
      handleType: options.type
    })
  },
  /*
   * get coupons
   */
  getCouponsList: function() {
    const $that = this
    const userInfo = wx.getStorageSync(STORAGEKEY) || {}
    const { phone } = userInfo || {}

    if (!phone) {
      return 
    }

    wx.showLoading()
    wx.login({
      success: res => {
        const { code } = res

        if (!code) {
          return
        }

        // 获取券列表
        getCouponsList({
          method: 'GET',
          data: {
            phone, code
          },
          success: res => {
            const { data } = res
            const { data: couponsList, success = false, msg = '' } = data
            wx.hideLoading()
            if (!success) {
              showToast(msg)
              return
            }

            $that.setData({
              couponsList: couponsList.map(coupon => {
                coupon.used_time = formatTime(coupon.gmt_exchange, '-')
                return coupon
              })
            })
          },
          fail: err => {
            wx.hideLoading()
            showToast('获取券信息失败')
            console.log(err)
          }
        })
      },
      fail: err => {
        wx.hideLoading()
        showToast('登录失败')
        console.log(err)
      }
    })
  },
  /**
   * 选中券
   */
  selectCoupon: function(e) {
    const { handleType, totalFee } = this.data

    if (handleType !== 'choose') {
      return 
    }

    const { selectCoupon = {} } = e.currentTarget.dataset
    const { coupons_money = 0, has_used = 1 } = selectCoupon
    if (has_used) {
      showToast('券已使用')
      return 
    }

    if (coupons_money > totalFee) {
      showToast('券面额大于订单总价，请重新选择')
      return 
    }

    app.globalData.couponInfo = selectCoupon
    wx.navigateBack({
      delta: 1
    })
  },
  /*
   * input code
   */
  codeInput: function(e) {
    this.setData({
      couponCode: e.detail.value
    })
  },
  /*
   * send code
   */
  sendCode: function() {
    const { couponCode } = this.data
    const userInfo = wx.getStorageSync(STORAGEKEY) || {}
    const { phone } = userInfo || {}
    const $that = this

    if (!phone) {
      // 未注册|未登录
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }

    if (!couponCode) {
      showToast('请输入抵用券凭证码')
      return 
    }
    
    // loading交互
    wx.showLoading()
    wx.login({
      success: function (res) {
        const { code } = res

        if (code) {
          exchangeCoupon({
            method: 'POST',
            data: {
              code,
              phone,
              couponCode
            },
            success: res => {
              const { success = false, msg = '' } = res.data
              wx.hideLoading()

              if (success) {
                showToast('领用成功')
                wx.redirectTo({
                  url: '/pages/coupons/index',
                })
              } else {
                showToast(msg)
              }
            },
            fail: err => {
              wx.hideLoading()
              showToast('对换抵用券失败')
            }
          })
        }
      },
      fail: err => {
        showToast('登录失败')
      }
    })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: SERVICENUMBER
    })
  }
})
