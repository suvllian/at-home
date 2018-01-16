var mysql = require('mysql');
var sqlStatementList = require('./sql-list');
var dataBaseConfig = require('./db-config');
var pool = mysql.createPool(dataBaseConfig.devMysql);

function Model(sqlStatement) {
  this.sqlStatement = sqlStatement
  this.result = {}
}

Model.prototype.operate = function(keys) {
  // this指向发生变化
  var $that = this
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      connection.query(sqlStatementList[$that.sqlStatement], keys, function(error, result) {
        if (!error) {
          resolve(result)
        } else {
          reject(error)
        }
        connection.release()
      })
    })
  })
}

module.exports = Model