import { COUPONSTORAGEKEY, STORAGEKEY } from '../config.js'
const app = getApp()

export const getSpecialEligibleCoupon = orderTypeParentId => {
  const couponsInfo = wx.getStorageSync(COUPONSTORAGEKEY) || []
  const eligibleCoupons = couponsInfo.filter(item => item.coupon_type == orderTypeParentId)

  if (eligibleCoupons.length) {
    app.globalData.couponInfo = eligibleCoupons[0]
  } else {
    app.globalData.couponInfo = {}
  }

  return eligibleCoupons.length ? true : false
}

export const getEligibleCoupon = totalFee => {
  const couponsInfo = wx.getStorageSync(COUPONSTORAGEKEY) || []
  const eligibleCoupons = couponsInfo.filter(item => item.coupons_money <= totalFee)
  const selectCoupon = app.globalData.couponInfo

  if (selectCoupon && selectCoupon.coupons_money) {
    return selectCoupon.coupons_money
  }

  if (eligibleCoupons.length) {
    app.globalData.couponInfo = eligibleCoupons[0]
  } else {
    app.globalData.couponInfo = {}
  }

  return eligibleCoupons.length ? eligibleCoupons[0].coupons_money : 0
}

export const getMemberScale = () => {
  const userInfo = wx.getStorageSync(STORAGEKEY) || {}
  return userInfo.memberScale || 0
}

export const getUserPhone = () => {
  const userInfo = wx.getStorageSync(STORAGEKEY) || {}
  const { phone = '' } = userInfo

  return phone
}

export const clearCouponInfo = () => {
  app.globalData.couponInfo = {}
}