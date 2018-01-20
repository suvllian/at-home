import { pay } from '../api/index.js'
import { APPID, PAYKEY } from '../config.js'
import { parseObjectParams, getRandomString } from './util.js'
import md5 from './md5.js'

export const wxPay = (orderId, totalFee, redirectUrl) => {
  wx.login({
    success: function (res) {
      const { code } = res

      if (code) {
        pay({
          method: 'POST',
          data: {
            orderId,
            totalFee,
            loginCode: code
          },
          success: function (res) {
            const { prepay_id = '', nonce_str = '' } = res.data && res.data.data

            if (!prepay_id) {
              console.log('下单失败')
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
                console.log('下单成功', res)
                wx.navigateTo({
                  url: redirectUrl
                })
              },
              fail: function (err) {
                console.log('下单失败', err)
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
