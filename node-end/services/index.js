var request = require('request');
var config = require('./../config/index.js');
var utils = require('./../utils/index.js');

function getOpenId(loginCode) {
  var params = {
    appid: config.APPID,
    secret: config.SECRET,
    js_code: loginCode,
    grant_type: 'authorization_code'
  }

  return new Promise((resolve, reject) => {
    request.get({
      url: utils.addParamsToUrl(config.LOGINURL, params),
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      }
    }, function (error, result, data) {
      !error ? resolve(JSON.parse(data)) : reject()
    })
  })
}

module.exports = {
  getOpenId
}