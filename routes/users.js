

//// 导入MySql模块
var mysql = require('mysql');
var dbConfig = require('../db/DBConfig');
var usersSQL = require('../db/Usersql');

var express = require('express');
var router = express.Router();


// 使用dbconfig.js 创建mysql连接池
var pool = mysql.createPool(dbConfig.mysql);
//响应一个json数据
var responesJson = function (res, ret) {
  if (typeof ret === 'undefined') {
    res.responesJson({
      code: '-200',
      msg: '操作失败'
    });
  } else {
    res.responesJson(req);
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//添加一个reg作为注册接口
router.get('/reg', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    var param = req.query || req.params;
    var Username = param.uid;
    var Psw = param.name;
    connection.query(usersSQL.queryAll, (err, res)=> {
      var isTrue = false;
      if (res) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].uid == Username && res[i].name == Psw) {
            isTrue = true;
          }
        }
      }
      var data = {};
      data.isreg = !isTrue;//如果isTrue布尔值为true则登陆成功 有false则失败
      if (isTrue) {
        data.result = {
          code: 1,
          msg: '用户已存在'
        };
      } else {
        connection.query(usersSQL.insert, [param.uid, param.name], function (err, result) {
          if (result) {
            data.result = {
              code: 200,
              msg: '注册成功'
            };
          } else {
            data.result = {
              code: -1,
              msg: '注册失败'
            };
          }
        });
      }
      if(err) data.err=err;
      //以json形式，把操作结果返回给前台界面
      setTimeout(()=>{
        responesJson(_res,data);
      },300)
      // 释放链接
      connection.release();
    })
  })
})

module.exports = router;
