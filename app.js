/**
 * 作者：胡志武
 * 时间：2019/2/27
 */

var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var swig = require("swig");
var session = require("express-session");
var path = require("path");
var app = express();
var ueditor = require("ueditor");
var Category = require("./models/Categories");
var multer = require("multer");
var upload = multer({dest:"upload/"});

//  连接数据库
mongoose.connect("mongodb://localhost/class");
//  配置body-parser
//  方便获取post请求的信息
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

//  配置模板引擎
//  第一个参数是模板引擎的后缀名，第二个参数是解析模板引擎的方法
app.engine("html",swig.renderFile);

//  设置views文件夹的位置

app.set("views",path.join(__dirname,"./views"));

//  注册使用的模板引擎信息，
app.set("view engine","html")
swig.setDefaults({cache:false});



app.use("/public/",express.static(path.join(__dirname,"./public")));


app.use(session({
    secret:"huzhiwu",
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:6000000,
        
    },
    rolling:true,
}))




// /ueditor 入口地址配置 https://github.com/netpi/ueditor/blob/master/example/public/ueditor/ueditor.config.js
// 官方例子是这样的 serverUrl: URL + "php/controller.php"
// 我们要把它改成 serverUrl: URL + 'ue'
app.use("/public/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {

    // ueditor 客户发起上传图片请求
  
    if(req.query.action === 'uploadimage'){
  
      // 这里你可以获得上传图片的信息
      var foo = req.ueditor;
    //   console.log(foo.filename); // exp.png
    //   console.log(foo.encoding); // 7bit
    //   console.log(foo.mimetype); // image/png
  
      // 下面填写你要把图片保存到的路径 （ 以 path.join(__dirname, 'public') 作为根路径）
      var img_url = 'yourpath';
      res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage'){
      var dir_url = 'your img_dir'; // 要展示给客户端的文件夹路径
      res.ue_list(dir_url) // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
  
      res.setHeader('Content-Type', 'application/json');
      // 这里填写 ueditor.config.json 这个文件的路径
      res.redirect('/public/ueditor/nodejs/config.json')
  }}));




app.use("/jk173",require(path.join(__dirname,"./routers/api.js")));
app.use("/",require(path.join(__dirname,"./routers/main.js")));

app.listen(80,function(err){
    if(!err){
        console.log("服务器启动成功");
    }
})


