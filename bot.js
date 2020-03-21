const process = require('dotenv').config().parsed

// console.log(process)

const TOKEN = process.TELEGRAM_TOKEN ;
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const axios = require('axios')
var fs = require('fs');
var countries = require('./country');
var rev_country = require('./rev country')
// console.log(rev_country.ethiopia);

// console.log(countries.ET)
const options = {
  polling: true
};
const bot = new TelegramBot(TOKEN, options);

// to match the word start or /start in case insensetive
bot.onText(/(\/|)start/ig, function start(msg){
  bot.sendMessage(msg.chat.id, `* Send me the word <b><i>World</i></b> to see global data
* send me country name or country code to see for specific country like <b>Ethiopia</b> or <b>ET</b>,<b>Italy</b> or <b>IT</b>, `,
{ parse_mode: "HTML" })
return;
})

// Matches world text 
bot.onText(/world/ig, async function world(msg) {
  bot.sendMessage(msg.chat.id, "your request is loading.please wait ...");
  try{
    var worldCovidData = await axios.get('https://thevirustracker.com/free-api?global=stats');
    var worldCovidData = await worldCovidData.data.results[0]
    // console.log( worldCovidData.total_cases)
    // console.log("ended")
    bot.sendMessage(msg.chat.id, `CoronaVirus covid-19: 
Confirmed Case: <b>${worldCovidData.total_cases}</b> 
Recovered:  <b>${worldCovidData.total_recovered}</b> 
Death:  <b>${worldCovidData.total_deaths}</b>
Total new cases today:  <b>${worldCovidData.total_new_cases_today}</b>
Total new deaths today: <b>${worldCovidData.total_new_deaths_today}</b>
Total active cases :    <b>${worldCovidData.total_active_cases}</b>
Total serious cases :   <b>${worldCovidData.total_serious_cases}</b>

<b>You can send me country name or county code to get info about that country</b>
Example: <code>Ethiopia</code> or <code>ET</code>` ,  { parse_mode: "HTML" })

  }catch(err){
    console.log(err.message)
     bot.sendMessage(msg.chat.id, `There is Network Error from our Server please try later!\n
    or Try Contacting the admin: @chapimenge`) 
  }
});

function toTitleCase(str) {
  // console.log(str);
  
  return str.replace(
      /\w\S*/g,
      function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
  );
}

// Matches /any word other than world and start or /start
bot.onText(/^(?!.*(world|\/start|start)).*$/gim, async function onOther(msg, match) {
  bot.sendMessage(msg.chat.id, "Your Request is processing...");
  // console.log(match);
  
  var text = match[0] ;
  var exist = checkCountry(text);
  if(exist !== 0){
    try {
      var countryCode;
      var countryName 
      if( exist == 1){
        
        countryCode = text;
        countryName = countries[countryCode]
        // console.log("capital");
      }
      else{        
        countryCode = rev_country[text.toLowerCase()]
        countryName = text
      }      
      var response = await axios.get(`https://thevirustracker.com/free-api?countryTotal=${countryCode}`)
      // console.log(countryCode,response.data.countrydata);
      var data = response.data.countrydata[0]
      
      bot.sendMessage(msg.chat.id, `CoronaVirus covid-19 data of ${toTitleCase(countryName)} - ${countryCode.toUpperCase()}: 
Confirmed Case: <b>${data.total_cases}</b> 
Recovered:  <b>${data.total_recovered}</b> 
Death:  <b>${data.total_deaths}</b>
Total new cases today:  <b>${data.total_new_cases_today}</b>
Total new deaths today: <b>${data.total_new_deaths_today}</b>
Total active cases :    <b>${data.total_active_cases}</b>
Total serious cases :   <b>${data.total_serious_cases}</b>`, {parse_mode: "HTML"})
    } catch (error) {
      console.log(error);
      bot.sendMessage(msg.chat.id,"Sorry internal server error , try to contact @chapimenge")
    }
  }else{
    bot.sendMessage(msg.chat.id,"Please send valid command to see exaple send me /start or start")

  }
});

function checkCountry(name){
  // console.log("Entered");
  name  = name.toUpperCase();
  for(var i in countries){
    if ( i === name){
      return 1;
    }
  }
  name = name.toLowerCase();
  for(var i in countries){
    if ( countries[i] === name){
      return 11;
    }
  }
  
  return 0;
}
