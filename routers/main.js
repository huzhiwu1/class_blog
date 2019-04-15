

var express = require("express");
var router = express.Router();
var Categories = require("../models/Categories.js");
var Content = require("../models/contents.js");
var url = require("url");
var Users = require("../models/Users");


router.use(function (req, res, next) {

    data = {
        userInfo: req.session.user,
        categories: []
    }

    Categories.find().then(function (categories) {
        data.categories = categories;
        next();
    });
});

/*
* 首页
* */
router.get('/jk173', function (req, res, next) {

    data.category = req.query.category || '';
    data.count = 0;
    data.page = Number(req.query.page || 1);
    data.limit = 10;
    data.pages = 0;
    var cd = req.query.cd
    var exp = new RegExp(cd);
    // console.log(cd);

    var where = {};
    if (data.category) {
        where.category = data.category
    }

    Content.where(where).count().then(function (count) {

        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages
        data.page = Math.min(data.page, data.pages);
        //取值不能小于1
        data.page = Math.max(data.page, 1);

        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find({
            isRemove: false
        }).limit(data.limit).skip(skip).populate(['category', 'user']).find({
            $or: [
                {
                    title: exp
                }
            ]
        }).sort({
            addTime: -1
        });

    }).then(function (contents) {
        // console.log(contents);
        data.contents = contents;
        // console.log(data)
        res.render('main/main', data);

    })
});
// Content.where(where).count().then(function(count) {

//     data.count = count;
//     //计算总页数
//     data.pages = Math.ceil(data.count / data.limit);
//     //取值不能超过pages
//     data.page = Math.min( data.page, data.pages );
//     //取值不能小于1
//     data.page = Math.max( data.page, 1 );

//     var skip = (data.page - 1) * data.limit;

//     return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({
//         addTime: -1
//     });

// }).then(function(contents) {
//     // console.log(contents);
//     data.contents = contents;
//     // console.log(data)
//     res.render('main/main', data);
// })

// // 搜索文章
// router.post("/jk173",function(req,res){
//     var cd = req.body.cd;
//     var exp = new RegExp(cd);
//     console.log(cd);
//     console.log(exp)
//     Content.find({
//        title:exp
//     },function(err,files){
//         if(!err){
//             data.contents = files;
//             console.log(data.contents)
//             res.render("main/main",data);
//         }
//     })
// })

//阅读文章

router.get("/jk173/view", function (req, res) {

    var contentId = req.query.contentId;
    Content.findOne({
        _id: contentId
    }).populate(["user", "category"]).exec(function (err, files) {
        if (!err) {
            if (files) {
                files.views++;
                files.save(function (err, files) {
                    if (!err) {
                        data.content = files;

                        res.render("article/read", data);
                    }

                })
            }


        }
    })

})

//评论提交
router.post("/jk173/comment", function (req, res) {

    var contentId = req.body.contentId;
    var postData;
    var userImg;
    // console.log(contentId);
    if (req.session.user) {

        Users.findOne({
            username: req.session.user.username,
        }, function (err, files) {
            if (!err) {
                // console.log(files.username)
                userImg = files.userImg
                // console.log(userImg);
                postData = {
                    username: req.session.user.username,
                    postTime: new Date(),
                    content: req.body.content,
                    userImg: userImg
                }
            }
        })



        Content.findOne({
            _id: contentId
        }, function (err, files) {
            files.comments.push(postData);
            files.commentNum += 1;
            files.views -= 1;
            files.save(function (err, ret) {
                if (!err) {
                    data.code = 9;


                    res.json(data);
                }
            })
        })

    } else {
        data.code = 10;//没登录不能评论
        console.log("没登录")
        res.status(200).json(data);
    }



})

module.exports = router;