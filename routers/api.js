

var express = require("express");
var router = express.Router();
var Users = require("../models/Users");
var Contents = require("../models/contents.js");
var Categories = require("../models/Categories.js");
var url = require("url");
var multer = require("multer");


//模板的Data

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload/')
    },
    filename: function (req, file, cb) {
        cb(null, req.session.user._id.toString() + '.jpg')
    }
})

var upload = multer({ storage: storage })
//  设置要要返回数据的格式
var responseData = {
    code: 0, //  0代表服务器出错，1 代表该用户重复注册   2代表注册成功
    message: ""
}

//  跳转到注册页面

router.get("/register", function (req, res) {
    res.render("./main/register.html", {});
})
//  注册页面
router.post("/register", function (req, res) {
    var username = req.body.name,
        password = req.body.password;

    Users.findOne({
        "username": username
    }, function (err, files) {
        if (err) {
            responseData.code = 0;
            responseData.message = "服务器出错";
            res.status(500).json(responseData);
        }
        if (files) {
            responseData.code = 1;
            responseData.message = "该用户已经存在！";
            res.status(200).json(responseData);
        } else {
            var user = new Users({
                username: username,
                password: password
            })

            user.save();
            responseData.code = 2;
            responseData.message = "注册成功";
            req.session.user = user;
            //  运行到json,后，node就不会再继续往后匹配了，运行
            res.status(200).json(responseData);

            //添加session,保存登录人的信息


        }

    })
})

/**
 * 用户登录
 */


router.get("/login", function (req, res) {
    res.render("main/login", {})
})

router.post("/login", function (req, res) {

    var username = req.body.name;
    var password = req.body.password;

    Users.findOne({
        username: username,
        password: password
    }, function (err, files) {
        if (err) {
            responseData.code = 0;
            responseData.message = "服务器出错"
            res.status(500).json(responseData);
        }
        if (files) {
            responseData.code = 4;
            req.session.user = files;   //加上session保持登录者的状态
            res.status(200).json(responseData);
            // console.log(files);
        } else {
            responseData.code = 3;//密码或姓名错误
            res.status(200).json(responseData);
        }
    })
})
/**
 * 用户退出
*/

router.get("/logout", function (req, res) {
    
    req.session.user = null;
    
    // res.status(200);
    res.redirect('/jk173');
  
})


/**
 * 
 * 用户写文章
 */
// 先判断用户登录了没有
router.get("/isLogin", function (req, res) {
    if (req.session.user == null) {
        responseData.code = 5;  // 代表用户没有登录
        res.status(200).json(responseData);
    } else {
        responseData.code = 6;  // 代表用户登录了
        res.status(200).json(responseData);
    }
})

//  再跳转到文章编写页面
router.get("/write", function (req, res) {

    Categories.find({}, function (err, files) {
        if (!err) {
            res.render("article/write", {
                categories: files,
                userInfo: req.session.user
            });
        } else {
            res.end("服务器出错");
        }
    })

})


//  获取用户写的文章，然后保存到数据库
router.post("/write", function (req, res) {

    new Contents({
        category: req.body.category,
        title: req.body.title,
        content: req.body.content,
        user: req.session.user._id.toString()

    }).save(function (err, files) {
        if (!err) {


            responseData.code = 7;//保存成功
            res.status(200).json(responseData);
        } else {
            console.log(err);
        }

    })
})




//进入个人主页
router.get("/homePage", function (req, res, next) {
    var data = {}
    Categories.find({}, function (err, files) {
        data.categories = files;
    })
    var where = {};


    where.user = req.session.user._id.toString();
    Contents.where(where).find({
        isRemove: false
    }).populate(['user', 'category']).exec(function (err, files) {
        // if(files){
        //     console.log(files[0]);
        //     data.myContents = files;
        //     data.userInfo=files[0].user;
        // }
        if (files.length==0) {
            Users.findOne({
                username: req.session.user.username
            }, function (err, files) {
                if (!err) {
                    console.log(files);
                    data.userInfo = files;
                    res.render("user/homepage", data);
                }
            })
        }else{
            data.myContents = files;
            data.userInfo = files[0].user;
            res.render("user/homepage",data);
        }

    })
    // .then(function(files){
    //     if(files==[]){
    //         Users.findOne({
    //             username:req.session.user.username
    //         },function(err,files){
    //             if(!err){
    //                 data.userInfo = files;
    //                 res.render("user/homepage",data);
    //             }
    //         })
    //     }
    // })
})



// Users.findOne({
//     username:req.session.user.username
// },function(err,files){
//     if(!err){

//     }
// })


router.post("/homePage", upload.single("userImg"), function (req, res) {

    if (req.file) {

        Users.updateOne({
            username: req.session.user.username
        }, {
                $set: {
                    dir: req.body.dir,
                    username: req.body.username,
                    userImg: req.file.path
                }
            }, function (err, files) {
                if (!err) {
                    responseData.code = 8;//保存成功
                    res.json(responseData);
                }
            })
    } else {
        Users.updateOne({
            username: req.session.user.username
        }, {
                $set: {
                    dir: req.body.dir,
                    username: req.body.username,

                }
            }, function (err, files) {
                if (!err) {
                    responseData.code = 8;//保存成功
                    console.log("1")
                    res.json(responseData);

                    console.log("")
                }
            })
    }


})

//删除文章
router.get("/remove", function (req, res) {
    var contentId = req.query.contentId;
    // console.log(contentId);
    Contents.updateOne({
        _id: contentId,
    }, {
            $set: {
                isRemove: true,
            }
        }, function (err, files) {
            if (!err) {
                responseData.code = 13//删除成功！；
                res.status(200).json(responseData);
            }
        })
})

//查看别人的主页
router.get("/other",function(req,res){
    var userId = req.query.userId;
    var data = {}
    Categories.find({}, function (err, files) {
        data.categories = files;
    })
    var where = {};

console.log(userId);
    where.user = userId
    Contents.where(where).find({
        isRemove: false
    }).populate(['user', 'category']).exec(function (err, files) {
        if (files.length==0) {
            Users.findOne({
                _id:userId 
            }, function (err, files) {
                if (!err) {
                    console.log(files);
                    data.other = files;
                    data.userInfo = req.session.user;
                    res.render("user/other", data);
                }
            })
        }else{
            data.myContents = files;
            data.other = files[0].user
            data.userInfo =req.session.user||"";
            res.render("user/other",data);
        }

    })
})
module.exports = router;