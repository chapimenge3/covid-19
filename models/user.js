var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userSchema = new Schema({
   chat_id:{
       type: String,
       unique: true
   },
    name: {
       type: String ,
       defalt : ''
   }, 
   username :{
       type: String , 
       default : ''
   }
   
});

var user = mongoose.model("user", userSchema);

module.exports = user;