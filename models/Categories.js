var mongoose = require("mongoose");
var CategorySchema = require("../schemas/categories");
var CategoryModel = mongoose.model("Category",CategorySchema);
module.exports = CategoryModel;