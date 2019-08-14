const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GamePlaySchema = new Schema([
{
    duree:{value:Number,type:String},
    startTime:Date,
    level:Number,
    gamers:[{key:String}]
}
]);

var GamePlay = mongoose.model("GamePlay",GamePlaySchema);
module.exports = {GamePlay};