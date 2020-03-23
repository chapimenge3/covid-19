var mongoose = require('mongoose');
var Schema = mongoose.Schema


var countrySchema =  new Schema({
    country: {
        type: String ,
        required: true,
        set: (name)=>{
            return name.toLowerCase();
        }
    }, 
    cases: {
        type: Number,
        default: 0
    }, 
    todayCases: {
        type: Number,
        default: 0
    }, 
    deaths: {
        type: Number,
        default: 0
    }, 
    todayDeaths: {
        type: Number,
        default: 0
    }, 
    recovered: {
        type: Number,
        default: 0
    }, 
    active: {
        type: Number,
        default: 0
    },
    critical: {
        type: Number,
        default: 0
    },
    last_update:{
        type: Date, 
        default: new Date()
    }
})

var country = mongoose.model("Country", countrySchema)

module.exports = country