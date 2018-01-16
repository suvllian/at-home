function responseJSON(res, result, method) {
	if (method === 'get') { 
		result ? res.jsonp(result) : res.json({code: '-200', msg: '操作失败', success: false})
	} else if (method === 'post') {
		result ? res.json({success: true}) : res.json({code: '-200', msg: '操作失败', success: false})
	}
}

// 设置返回信息
function setResponse (res, result, success) {
  var successMap = {
    msg: success ? '操作成功' : '操作失败',
    success: success
  }

  result = result || {}
  res.json(Object.assign({}, successMap, result))
}
function successRes(res, result) {
  setResponse(res, result, true)
}
function failRes(res, result) {
  setResponse(res, result, false)
}

function parseUrlParams(params) {
  var paramArr = []
  for (var key in params) {
    paramArr.push(key + '=' + encodeURIComponent(params[key]))
  }

  return paramArr.join('&')
}

function addParamsToUrl(url, params) {
  var paramStr = parseUrlParams(params)

  return url.indexOf('?') !== -1 ? url + '&' + paramStr : url + '?' + paramStr
}

/*
 * action: 生成留位随机数
 * @return { string }
 */
function MathRand() {
  var Num = ""
  for (var i=0; i<6; i++) {
    Num += Math.floor(Math.random() * 10)
  }
  return Num
}

module.exports = {
  responseJSON, 
  addParamsToUrl,
  successRes,
  failRes,
  MathRand
}