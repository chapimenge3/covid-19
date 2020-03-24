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
   },
   usage : {
       type:Number,
       default: 0
   },
   notifyed:{
       type: Boolean, 
       default: false
   }
});

var user = mongoose.model("user", userSchema);

module.exports = user;