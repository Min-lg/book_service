var express = require('express');
var router = express.Router();
// 数据库引入
var mongoose = require('mongoose')
// 模块依赖引入
var user = require('../models/user')
var recommend = require('../models/recommend')
var movie = require('../models/movie')
var article = require('../models/article')
/* GET home page. */
// 定义路由
// 数据库连接测试
router.get('/mongooseTest', function (req, res, next) {
  // coonect   第一个参数：数据库url地址 第二个参数：传递配置
  mongoose.connect('mongodb://localhost/pets', { useMongoClient: true })
  mongoose.Promise = global.Promise;
  // 通过model方法传入名称和结构创建一个数据集
  var Cat = mongoose.model('Cat', { name: String })
  // 传入一个name 属性
  var tom = new Cat({ name: 'Tom' })
  // model自带的save()方法保存数据
  tom.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('success insert');
    }
  })
  // 输入一个提示
  res.send('数据库连接测试')
})
// 显示主页的推荐大图等
router.get('/showIndex', function (req, res, next) {
  recommend.findAll(function (err, getRecommend) {
    res.json({ status: 0, message: "获取推荐", data: getRecommend })
  })
})
// 显示所有的排行榜，也就是对于电影字段的index样式
// router.get('/showRanking', function (req, res, next) {
//   movie.find({ movieMainPage: true }, function (err, getMovies) {
//     res.json({ status: 0, message: "获取主页", data: getMovies })
//   })
// })
// 显示电影列表
router.get('/showMovies',function(req,res,next){
  movie.findAll(function(err,getMovies){
    res.json({ status: 0, message: "获取所有电影", data: getMovies })
  })
})
// 显示文章列表
router.get('/showArticle', function (req, res, next) {
  article.findAll(function (err, getArticles) {
    res.json({ status: 0, message: "获取文章列表", data: getArticles })
  })
})
// 显示文章的内容
router.post('/articleDetail', function (req, res, next) {
  // 验证完整性
  if (!req.body.article_id) {
    res.json({ status: 1, message: '文章id出错' })
  }
  article.findByArticleId(req.body.article_id, function (err, getArticle) {
    res.json({ status: 0, message: '获取成功', data: getArticle })
  })
})
// 显示用户的个人信息内容
router.post('/showUser', function (req, res, next) {
  // 验证完整性
  if (!req.body.user_id) {
    res.json({ status: 1, message: '用户状态出错' })
  }
  user.findById(req.body.user_id, function (err, getUser) {
    res.json({
      status: 0, message: "获取成功", data: {
        user_id: getUser._id,
        username: getUser.username,
        userMail: getUser.userMail,
        userPhone: getUser.userPhone,
        userStop: getUser.userStop
      }
    })
  })
})

module.exports = router;
