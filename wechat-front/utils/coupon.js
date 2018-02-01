import { getEffectiveCoupons } from '../api/index.js'
import { STORAGEKEY, COUPONSTORAGEKEY } from '../config.js'

export const getEffectiveCouponsInfor = () => {
  const userInfo = wx.getStorageSync(STORAGEKEY) || {}
  const { phone } = userInfo

  if (!phone) {
    return
  }

  wx.login({
    success: res => {
      const { code } = res

      if (!code) {
        return
      }

      getEffectiveCoupons({
        method: 'GET',
        data: {
          code, phone
        },
        success: res => {
          const { data = {} } = res
          const { data: effictiveCouponList = [], success = false } = data

          if (!success) {
            return
          }

          if (effictiveCouponList.length > 1) {
            effictiveCouponList.sort((a, b) => {
              return b.coupons_money - a.coupons_money
            })
          }

          wx.setStorageSync(COUPONSTORAGEKEY, effictiveCouponList)
        },
        fail: err => {
          console.log(err)
        }
      })
    }
  })
}