var mongoose = require("mongoose");
module.exports = new mongoose.Schema({
    username:String,
    password:String,
    dir:String,
    userImg:String,
    isAdmin:{
        type:Boolean,
        default:false,
    },
    isBlack:{
        type:Boolean,
        default:false,
    }
})