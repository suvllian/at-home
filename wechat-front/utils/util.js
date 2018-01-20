const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
// 生成随机字符串
export const getRandomString = length => {
  let res = "";
  for (let i = 0; i < length; i++) {
    let id = Math.ceil(Math.random() * 35);
    res += chars[id];
  }

  return res;
}

// 将对象转换成&拼接的字符串
export const parseObjectParams = params => {
  var paramArr = []
  for (var key in params) {
    paramArr.push(key + '=' + params[key])
  }

  return paramArr.join('&')
}

// 获取当前日期
export const getCurrentDate = (connectSymbol) => {
  const dateObject = new Date()
  const year = dateObject.getFullYear()
  const month = String(dateObject.getMonth() + 1).padStart(2, '0')
  const day = dateObject.getDate()

  return [year, month, day]
}

export const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const formatMakettime = (dateString) => {
  return (new Date(dateString)).toString().split(' ', 4).slice(1, 4).join(' ')
}

