var express = require('express');
var router = express.Router();
// 数据库引入
var mongoose = require('mongoose')
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
// 定义路由
router.get('/mongooseTest', function (req, res, next) {
  // coonect   第一个参数：数据库url地址 第二个参数：传递配置
  mongoose.connect('mongodb://localhost/pets', { useMongoClient: true })
  mongoose.Promise = global.Promise;
  // 通过model方法传入名称和结构创建一个数据集
  var Cat = mongoose.model('Cat', { name: String })
  // 传入一个name 属性
  var tom = new Cat({ name: 'Tom' })
  // model自带的save()方法保存数据
  tom.save(function(err){
    if(err) {
      console.log(err);
    }else{
      console.log('success insert');
    }
  })
  // 输入一个提示
  res.send('数据库连接测试')
})

module.exports = router;
