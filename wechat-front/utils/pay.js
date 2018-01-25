import { pay, login, checkPaySuccess } from '../api/index.js'
import { APPID, PAYKEY, STORAGEKEY } from '../config.js'
import { parseObjectParams, getRandomString, showToast } from './util.js'
import md5 from './md5.js'
const app = getApp()

export const wxPay = (orderId, totalFee, redirectUrl, params) => {
  const userInfo = wx.getStorageSync(STORAGEKEY) || {}
  const { phone } = userInfo || {}
  // 地址信息
  const { choosedAddress, couponInfo } = app.globalData

  if (!phone) {
    // 未注册
    wx.navigateTo({
      url: '/pages/login/index'
    })
    return 
  }
  // 未选择服务地址
  if (!choosedAddress) {
    wx.navigateTo({
      url: '/pages/address-list/index?type=choose'
    })
    return
  }
  // 地址ID
  const { addressId } = choosedAddress
  const { coupon_id: couponId = 0 } = couponInfo

  wx.login({
    success: function (res) {
      const { code } = res

      if (code) {
        login({
          method: 'POST',
          data: {
            phone,
            loginCode: code
          },
          success: res => {
            const { success = false, msg = '', noRegister = false, noLogin = false } = res.data
            
            // 登录失败
            if (!success) {
              if (noRegister || noLogin) {
                // 未注册
                wx.navigateTo({
                  url: '/pages/login/index'
                })
              } else {
                console.log(msg)
                return
              }
            } else {
              wx.login({
                success: res => {
                  const { code } = res

                  if (code) {
                    pay({
                      method: 'POST',
                      data: {
                        phone,
                        orderId,
                        totalFee,
                        addressId,
                        couponId,
                        ...params,
                        loginCode: code
                      },
                      success: function (res) {
                        const { prepay_id = '', nonce_str = '', newOrderId = 0 } = res.data && res.data.data || {}

                        if (!prepay_id) {
                          showToast('下单失败')
                          return
                        }

                        const params = {
                          appId: APPID,
                          nonceStr: getRandomString(28),
                          package: `prepay_id=${prepay_id}`,
                          signType: 'MD5',
                          timeStamp: `${new Date().getTime()}`,
                          key: PAYKEY
                        }
                        // 生成签名
                        const paySign = md5.hexMD5(parseObjectParams(params)).toUpperCase()
                        delete params['key']

                        wx.requestPayment({
                          ...params,
                          paySign,
                          success: function (res) {
                            checkPaySuccess({
                              method: 'POST',
                              data: {
                                orderId,
                                newOrderId,
                                couponId
                              },
                              success: res => {
                                showToast('支付成功')
                              },
                              fail: err => {
                                showToast('支付失败')
                              }
                            })
                            if (!!redirectUrl) {
                              wx.redirectTo({
                                url: redirectUrl
                              })
                            }
                          },
                          fail: function (err) {
                            checkPaySuccess({
                              method: 'POST',
                              data: {
                                orderId,
                                newOrderId,
                                couponId
                              },
                              success: res => {
                                console.log(res)
                              },
                              fail: err => {
                                console.log(err)
                              }
                            })
                            showToast('下单失败')
                          }
                        })
                      },
                      fail: function (err) {
                        console.log(err)
                      }
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
}
