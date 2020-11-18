// 引入数据库的连接模块
var mongoose = require('../common/db')
// 数据库的数据集
var article = new mongoose.Schema({
  articleTitle: String,
  articleContext: String,
  articleTime: String,
  articleMainPage:Boolean
})
// 通过ID查找
article.statics.findByArticleId = function (id, callBack) {
  this.find({ _id: id }, callBack)
}
// 查询全部数据
article.statics.findAll = function (callBack) {
  this.find({}, callBack)
}
var articleModel = mongoose.model('article', article)
module.exports = articleModel