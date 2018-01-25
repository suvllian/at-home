import { APIROOT } from '../config.js'

const wxRequest = (params, url) => {
  wx.request({
    url,
    method: params.method || "GET",
    data: params.data || {},
    header: {
      "Content-Type": "application/json"
    },
    success: res => {
      params.success && params.success(res)
    },
    fail: res => {
      params.fail && params.fail(res)
    },
    complete: res => {
      params.complete && params.complete(res)
    }
  })
}

// 一、auth
// 登录
export const login = params => wxRequest(params, `${APIROOT}/auth/login`)
// 注册
export const register = params => wxRequest(params, `${APIROOT}/auth/register`)
// 获取验证码
export const getCode = params => wxRequest(params, `${APIROOT}/auth/get_phone_code`)

// 二、order
// 查询订单列表
export const getOrderList = params => wxRequest(params, `${APIROOT}/order/get_order_list`)
// 检查订单状态
export const checkPaySuccess = params => wxRequest(params, `${APIROOT}/order/check_pay`)
// 支付
export const pay = params => wxRequest(params, `${APIROOT}/order/pay_order`)

// 三、地址
// 添加地址
export const addAddress = params => wxRequest(params, `${APIROOT}/address/add_address`)
// 获取地址信息
export const getAddress = params => wxRequest(params, `${APIROOT}/address/get_address_list`)

// 四、卡券
// 兑换抵用券
export const exchangeCoupon = params => wxRequest(params, `${APIROOT}/coupon/exchange_sent_coupon`)
// 获取抵用券列表
export const getCouponsList = params => wxRequest(params, `${APIROOT}/coupon/get_coupons_list`)
// 获取用户有效的券列表
export const getEffectiveCoupons = params => wxRequest(params, `${APIROOT}/coupon/get_effective_coupons`)

// 获取订单类型信息
export const getOrderTypeInfo = params => wxRequest(params, `${APIROOT}/get_order_tpye_info/${params.query.orderType}`)
// 获取所有卡券
export const getCardsList = params => wxRequest(params, `${APIROOT}/get_card_list`)
// 获取家政服务和企业清洁
export const getPageInfor = params => wxRequest(params, `${APIROOT}/get_page_information`)



