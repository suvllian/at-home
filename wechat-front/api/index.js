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

// 登录
export const login = params => wxRequest(params, `${APIROOT}/login`)
// 注册
export const register = params => wxRequest(params, `${APIROOT}/register`)
// 获取订单类型信息
export const getOrderTypeInfo = params => wxRequest(params, `${APIROOT}/get_order_tpye_info/${params.query.orderType}`)
// 添加地址
export const addAddress = params => wxRequest(params, `${APIROOT}/add_address`)
// 获取地址信息
export const getAddress = params => wxRequest(params, `${APIROOT}/get_address_list/${params.query.loginCode}`)
// 查询订单列表
export const getOrderList = params => wxRequest(params, `${APIROOT}/get_order_list/${params.query.userId}`)
// 支付
export const pay = params => wxRequest(params, `${APIROOT}/pay_order`)
// 获取验证码
export const getCode = params => wxRequest(params, `${APIROOT}/get_phone_code`)

const getCardById = params => wxRequest(params, `${APIROOT}/api/hp/detail/${params.query.id}`)
const getCardIdList = params => wxRequest(params, `${APIROOT}/api/hp/idlist/0`)
const getCardByMonth = params => wxRequest(params, `${APIROOT}/api/hp/bymonth/${params.query.month}`)
