const HOST = "http://v3.wufazhuce.com:8000"

const wxRequest = (params, url) => {
  wx.showToast({
    title: "加载中",
    icon: "loading"
  })
  wx.request({
    url,
    method: params.method || "GET",
    data: params.data || {},
    header: {
      "Content-Type": "application/json"
    },
    success: res => {
      params.success && params.success(res)
      wx.hideToast()
    },
    fail: res => {
      params.fail && params.fail(res)
    },
    complete: res => {
      params.complete && params.complete(res)
    }
  })
}

const getCardById = params => wxRequest(params, `${HOST}/api/hp/detail/${params.query.id}`)
const getCardIdList = params => wxRequest(params, `${HOST}/api/hp/idlist/0`)
const getCardByMonth = params => wxRequest(params, `${HOST}/api/hp/bymonth/${params.query.month}`)

module.exports = {
  getCardById, getCardIdList, getCardByMonth
}
