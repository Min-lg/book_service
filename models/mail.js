// 引入数据库的连接模块
var mongoose = require('../common/db')
// 建立mail的数据内容
var mail = new mongoose.Schema({
  fromUser: String,
  toUser: String,
  title: String,
  context: String
})
// 数据操作的一些常用方法
mail.statics.findByToUserId = function (user_id, callBack) {
  this.find({ toUser: user_id }, callBack)
}
mail.statics.findByFromUserId = function (user_id, callBack) {
  this.find({ fromUser: user_id }, callBack)
}
var mailModel = mongoose.model('mail', mail)
module.exports = mailModel
