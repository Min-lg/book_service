// 引入数据库的连接模块
var mongoose = require('../common/db')
// 数据库的数据集
var recommend = new mongoose.Schema({
  recommendImg: String,
  recommendSrc: String,
  recommendTitle: String
})
// 数据操作的一些常用方法
// 通过Id获得主页推荐
recommend.statics.findByIndexId = function (m_id, callBack) {
  this.find({ findByIndexId: m_id }, callBack)
}
// 找到所有的推荐
recommend.statics.findAll = function (callBack) {
  this.find({}, callBack)
}
var recommendModel = mongoose.model('recommend', recommend)
module.exports = recommendModel