var express = require('express');
var router = express.Router();
// 数据库引入
var mongoose = require('mongoose')
var crypto = require('crypto')
const init_token = 'TKLO2o'

var user = require('../models/user')
var movie = require('../models/movie');
var comment = require('../models/comment');
var article = require('../models/article');
var recommend = require('../models/recommend');
const { move } = require('../app');


// 新增电影
router.post('/movieAdd', function (req, res, next) {
  // 验证完整性
  if (!req.body.username) {
    res.json({ status: 1, message: "用户名为空" })
  }
  if (!req.body.token) {
    res.json({ status: 1, message: "登录出错" })
  }
  if (!req.body.id) {
    res.json({ status: 1, message: "用户传递错误" })
  }
  if (!req.body.movieName) {
    res.json({ status: 1, message: "电影名称为空" })
  }
  if (!req.body.movieImg) {
    res.json({ status: 1, message: "电影图片为空" })
  }
  if (!req.body.movieDownload) {
    res.json({ status: 1, message: "电影下载地址为空" })
  }
  var movieMainPage = req.body.movieMainPage ? null : false
  // 验证用户情况
  user.findByUsername(req.body.username, function (err, findUser) {
    if (findUser[0].userAdmin && !findUser[0].userStop) {
      // 根据数据集建立需要存入数据库的内容
      var saveMovie = new movie({
        movieName: req.body.movieName,
        movieImg: req.body.movieImg,
        movieVideo: req.body.movieVideo,
        movieDownload: req.body.movieDownload,
        movieTime: Date.now(),
        movieNumSuppose: 0,
        movieNumDownload: 0,
        movieMainPage: movieMainPage
      })
      // 保存合适的数据集
      saveMovie.save(function (err) {
        if (err) {
          res.json({ status: 1, message: err })
        } else {
          res.json({ status: 0, message: "添加成功" })
        }
      })
    } else {
      res.json({ error: 1, message: "用户没有权限或者已经停用" })
    }
  })

})
// 删除电影
router.post('/movieDel', function (req, res, next) {
  // 验证完整性
  if (!req.body.movieId) {
    res.json({ status: 1, message: "电影id传递失败" })
  }
  if (!req.body.username) {
    res.json({ status: 1, message: "用户名为空" })
  }
  if (!req.body.token) {
    res.json({ status: 1, message: "登录出错" })
  }
  if (!req.body.id) {
    res.json({ status: 1, message: "用户传递错误" })
  }
  user.findByUsername(req.body.username, function (err, findUser) {
    if (findUser[0].userAdmin && !findUser[0].userStop) {
      movie.remove({ _id: req.body.movieId }, function (err, delMovie) {
        res.json({ status: 0, message: '删除成功', data: delMovie })
      })
    } else {
      res.json({ error: 1, message: '用户没有权限或者已停用' })
    }
  })
})
// 更新电影
router.post('/movieUpdate', function (req, res, next) {
  // 验证完整性
  if (!req.body.movieId) {
    res.json({ status: 1, message: "电影id传递失败" })
  }
  if (!req.body.username) {
    res.json({ status: 1, message: "用户名为空" })
  }
  if (!req.body.token) {
    res.json({ status: 1, message: "登录出错" })
  }
  if (!req.body.id) {
    res.json({ status: 1, message: "用户传递错误" })
  }
  // 创建数组集合
  var updateContent = {
    movieName: req.body.movieName,
    movieImg: req.body.movieImg,
    movieVideo: req.body.movieVideo,
    movieDownload: req.body.movieDownload,
    movieTime: req.body.movieTime,
    movieNumSuppose: req.body.movieNumSuppose,
    movieNumDownload: req.body.movieNumDownload,
    movieMainPage: req.body.movieMainPage ? req.body.movieMainPage : false
  };
  // 存储
  user.findByUsername(req.body.username, function (err, findUser) {
    if (findUser[0].userAdmin && !findUser[0].userStop) {
      // 第一个参数为查询条件，第二个为对象，key(要修改的字段名)：value（要修改的值）
      movie.update({ _id: req.body.movieId }, updateContent, function (err, delMovie) {
        if (err) {
          res.json({ status: 1, message: '电影不存在', data: delMovie })
        } else {
          delMovie.nModified == 0 ? res.json({ status: 1, message: '内容无改动' }) : res.json({ status: 0, message: '修改成功', data: delMovie })
        }
      })
    } else {
      res.json({ error: 1, message: '用户没有权限或者已停用' })
    }
  })
})
// 获取所有电影
router.post('/movie', function (req, res, next) {
  movie.findAll(function (err, allMovie) {
    res.json({ status: 0, message: '获取成功', data: allMovie })
  })
})
// 获取所有用户评论
router.get('/commentList', function (req, res, next) {
  comment.findAll(function (err, allComment) {
    res.json({ status: 0, message: "获取所有用户评论成功", data: allComment });
  })
});
// 审核用户的评论
router.post('/checkComment', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  if (!req.body.comment_id)
    res.json({ status: 1, message: "评论id为空" });
  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower >= 1) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        comment.update({ _id: req.body.comment_id }, { check: true }, function (err, updateComment) {
          if (updateComment.nModified == 0)
            res.json({ status: 1, message: "评论已审核或评论id不存在" });
          else
            res.json({ status: 0, message: "评论审核成功", data: updateComment });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});
// 删除用户的评论
router.post('/delComment', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  if (!req.body.comment_id)
    res.json({ status: 1, message: "评论id为空" });
  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower >= 1) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        comment.remove({ _id: req.body.comment_id }, function (err, delComment) {
          if (delComment.deletedCount == 0)
            res.json({ status: 1, message: "评论id不存在" });
          else
            res.json({ status: 0, message: "评论删除成功", data: delComment });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});
// 封停用户
router.post('/stopUser', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  if (!req.body.stopUser_id)
    res.json({ status: 1, message: "需要封停的id为空" });
  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower == 2) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        user.update({ _id: req.body.stopUser_id }, { userStop: true }, function (err, stopUser) {
          if (stopUser.nModified == 0)
            res.json({ status: 1, message: "用户已被封停或用户id不存在" });
          else
            res.json({ status: 0, message: "用户封停成功", data: stopUser });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});
// 更新用户密码
router.post('/changeUser', function (req, res, next) {
  // 进行相关验证
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id错误" });
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.newPassword)
    res.json({ status: 1, message: "用户新密码错误" });
  // 数据库验证用户是否存在
  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower > 0) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        user.update({ _id: req.body.user_id }, { password: req.body.newPassword }, function (err, updateUser) {
          if (updateUser.nModified == 0)
            res.json({ status: 1, message: "用户id不存在" });
          else
            res.json({ status: 0, message: "密码修改成功", data: updateUser });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
})
// 获取所有用户
router.post('/showUser', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower >= 1) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        user.findAll(function (err, allUser) {
          res.json({ status: 0, message: "获取所有用户成功", data: allUser });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});
// 升级为管理员用户
router.post('/powerUpdate', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  if (!req.body.updateUser_id)
    res.json({ status: 1, message: "需要管理权限的id为空" });
  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower == 2) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        user.update({ _id: req.body.updateUser_id }, { userAdmin: true, userPower: 2 }, function (err, updateUser) {
          if (updateUser.nModified == 0)
            res.json({ status: 1, message: "用户已经是管理员或用户id不存在" });
          else
            res.json({ status: 0, message: "用户权限修改成功", data: updateUser });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});
// 添加文章
router.post('/addArticle', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  if (!req.body.articleTitle) {
    res.json({ status: 1, message: "影评标题为空" });
    return;
  }
  if (!req.body.articleContext) {
    res.json({ status: 1, message: "影评内容为空" });
    return;
  }

  var articleMainPage = req.body.articleMainPage ? req.body.articleMainPage : false;

  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower >= 1) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        var nowTime = new Date();
        var saveArticle = new article({
          articleTitle: req.body.articleTitle,
          articleContext: req.body.articleContext,
          // nowTime.toLocaleString('zh');    // 2018-4-4 15:08:38
          //nowTime.toLocaleString('en');    // 4/4/2018, 3:08:38 PM
          articleTime: nowTime.toLocaleString('zh'),
          articleMainPage: articleMainPage
        });
        saveArticle.save(function (err) {
          if (err)
            res.json({ status: 1, message: err });
          else
            res.json({ status: 0, message: "影评添加成功" });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});
// 删除文章
router.post('/delArticle', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  if (!req.body.article_id)
    res.json({ status: 1, message: "影评id为空" });
  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower >= 1) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        article.remove({ _id: req.body.article_id }, function (err, delArticle) {
          if (delArticle.deletedCount == 0)
            res.json({ status: 1, message: "影评id不存在" });
          else
            res.json({ status: 0, message: "影评删除成功", data: delArticle });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});
// 添加主页推荐图片
router.post('/addRecommend', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  if (!req.body.recommendImg)
    res.json({ status: 1, message: "推荐图片的链接为空" });
  if (!req.body.recommendSrc)
    res.json({ status: 1, message: "推荐图片的跳转地址为空" });
  if (!req.body.recommendTitle)
    res.json({ status: 1, message: "推荐图片的标题为空" });

  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower > 1) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        var saveRecommend = new recommend({
          recommendImg: req.body.recommendImg,
          recommendSrc: req.body.recommendSrc,
          recommendTitle: req.body.recommendTitle
        });
        saveRecommend.save(function (err) {
          if (err)
            res.json({ status: 1, message: err });
          else
            res.json({ status: 0, message: "主页推荐添加成功" });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});
// 删除主页推荐
router.post('/delRecommend', function (req, res, next) {
  if (!req.body.username)
    res.json({ status: 1, message: "用户名为空" });
  if (req.body.token != getMD5Password(req.body.user_id))
    res.json({ status: 1, message: "用户登录出错" });
  if (!req.body.user_id)
    res.json({ status: 1, message: "用户id为空" });
  if (!req.body.recommend_id)
    res.json({ status: 1, message: "主页推荐的id为空" });

  user.findByUsername(req.body.username, function (err, getUser) {
    var userPower = getUser[0].userPower;
    if (userPower > 1) {
      if (getUser[0].userAdmin && !getUser[0].userStop) {
        recommend.remove({ _id: req.body.recommend_id }, function (err, delRecommend) {
          if (delRecommend.deletedCount == 0)
            res.json({ status: 1, message: "主页推荐id不存在" });
          else
            res.json({ status: 0, message: "主页推荐删除成功", data: delRecommend });
        })
      } else {
        res.json({ status: 1, message: "用户不是管理员或账号已被停用" });
      }
    } else {
      res.json({ status: 1, message: "您没有权限执行此操作" });
    }
  });
});

// 获取MD5值
function getMD5Password(id) {
  var md5 = crypto.createHash('md5')
  var token_before = id + init_token
  // res.json(userSave[0]._id)
  return md5.update(token_before).digest('hex')
}
// 导出路由
module.exports = router