const process = require('dotenv').config().parsed
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const axios = require('axios')
var fs = require('fs');
var countries = require('./country');
var cron = require('node-cron');
var mongoose = require('mongoose');

// Dictionary
var rev_country = require('./rev country')
var topCountry = require("./top10")
var main = require("./main")
// console.log(main);

// db models 
const countryModel = require("./models/country")
const worldModel = require("./models/world")
const user = require("./models/user")
// console.log(process)



// db connection
mongoose.connect('mongodb://localhost:27017/covid', { useNewUrlParser: true, useUnifiedTopology: true });
var dbconnected = true
var db = mongoose.connection;
db.on('error', () => {
  dbconnected = false
  console.error.bind(console, 'connection error:');
});
db.once('open', function () {
  console.log("Connected");
});
mongoose.set('useFindAndModify', false);

// console.log(dbconnected);


const TOKEN = process.TELEGRAM_TOKEN ;
const options = {
  polling: true
};
const bot = new TelegramBot(TOKEN, options);


// to match the word start or /start in case insensetive
bot.onText(/(\/|)start/ig, async function start(msg) {
  console.log("Start");
  bot.sendMessage(msg.chat.id, "Welcome To Covid 19 statistics Bot");

  const existUser = await user.exists({ chat_id: msg.chat.id })
  if (existUser === false) {
    var num;
    const created = await user.create({ chat_id: msg.chat.id, name: msg.chat.first_name, username: msg.chat.username })
    user.count({}, (err, count) => {
      if (err) return;
      num = count
      bot.sendMessage(441672839, msg.from.first_name + ". username = " + msg.from.username + " Total num of user is " + count.toString())
    });
  }
  bot.sendMessage(msg.chat.id, `* Send me the word <strong><i>World</i></strong> to see global data
* Send me /top10 or top10 to see Top 10 Countries by Total case and total death 
* send me country name or country code to see for specific country like <strong>Ethiopia</strong> or <strong>ET</strong>,<strong>Italy</strong> or <strong>IT</strong>, 

Author: <strong>@chapimenge</strong>`,
    { parse_mode: "HTML" })
  return;
})




// Matches world text 
bot.onText(/world/ig, async function world(msg) {
  // bot.sendMessage(msg.chat.id, "Wait a second");
  console.log("World func");
  // return;
  bot.sendMessage(msg.chat.id, "Wait a second your request is loading.please wait ...");
  try {
    const existUser = await user.exists({ chat_id: msg.chat.id })
    if (existUser === false) {
      var num;
      const created = await user.create({ chat_id: msg.chat.id, name: msg.chat.first_name, username: msg.chat.username })
      user.count({}, (err, count) => {
        if (err) return;
        num = count
        bot.sendMessage(441672839, msg.from.first_name + ". username = " + msg.from.username + " Total num of user is " + count.toString())
      });
    }


    const worldCovidData = worldModel.findOne({ _id: "5e7855cf2a0d5c0b23937a2d" }, (err, doc) => {
      if (err) {
        bot.sendMessage(441672839, err.message)
        bot.sendMessage(msg.chat.id, `There is Network Error from our Server please try later!\n
    or Try Contacting the admin: @chapimenge`)
        console.log("Finding world error: ", err.message);
        return;
      }
      bot.sendMessage(msg.chat.id, `Worlds CoronaVirus covid-19: 
Confirmed Case: <b>${doc.cases}</b> 
Recovered:  <b>${doc.recovered}</b> 
Death:  <b>${doc.deaths}</b>
Today Death:  <b>${doc.todayDeaths}</b>\n
<b>You can send me top10 , Country name or County code to get info about that country</b>
Example: <code>Ethiopia</code> or <code>ET</code>

Created by: @chapimenge` , { parse_mode: "HTML" })
      return;
    });
  } catch (err) {
    bot.sendMessage(441672839, err.message)
    console.log(err.message)
    bot.sendMessage(msg.chat.id, `There is Network Error from our Server please try later!\n
    or Try Contacting the admin: @chapimenge`)
  }
});





bot.onText(/(\/|)top10/ig, async function world(msg) {
  bot.sendMessage(msg.chat.id, "your request is loading.please wait ...");
  try {
    const existUser = await user.exists({ chat_id: msg.chat.id })
    if (existUser === false) {
      var num;
      const created = await user.create({ chat_id: msg.chat.id, name: msg.chat.first_name, username: msg.chat.username })
      user.count({}, (err, count) => {
        if (err) return;
        num = count
        bot.sendMessage(441672839, msg.from.first_name + ". username = " + msg.from.username + " Total num of user is " + count.toString())
      });
    }

    // sort by case
    countryModel.find().sort({ "cases": -1 }).exec(function (err, docs) {

      if (err) {
        console.log(err.message);
        return;
      }

      outCase = `Top 10 Countries by <strong>Total Confirmed Case</strong>:\n`
      for (var i = 0; i < 10; i++) {
        outCase += `${i + 1}. ${docs[i].country} => ${docs[i].cases}\n`
      }
      bot.sendMessage(msg.chat.id, `${outCase}\n
Created by: @chapimenge` , { parse_mode: "HTML" })
    });

    // sort by death
    countryModel.find().sort({ "deaths": -1 }).exec(function (err, docs) {
      if (err) {
        console.log(err.message);
        return;
      }
      outDeath = `Top 10 Countries by <strong>Total Death Number</strong>:\n`
      for (var i = 0; i < 10; i++) {
        outDeath += `${i + 1}. ${docs[i].country} => ${docs[i].deaths}\n`
      }
      bot.sendMessage(msg.chat.id, `${outDeath}\n
Created by: @chapimenge` , { parse_mode: "HTML" })
    });
  } catch (err) {
    bot.sendMessage(441672839, err.message)
    console.log(err.message) //There is Network Error from our Server please try later
    bot.sendMessage(msg.chat.id, `Our Server is down because of unexpected number of user rising like Covid. We will be back soon\n
    or Try Contacting the admin: @chapimenge`)
  }
});
function toTitleCase(str) {
  // console.log(str);

  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

// Matches /any word other than world and start or /start
bot.onText(/^(?!.*(world|\/start|start|top10|\/top10)).*$/gim, async function onOther(msg, match) {

  // console.log(match);

  var text = match[0];
  var exist = checkCountry(text);
  if (exist !== 0) {
    const existUser = await user.exists({ chat_id: msg.chat.id })
    if (existUser === false) {
      var num;
      const created = await user.create({ chat_id: msg.chat.id, name: msg.chat.first_name, username: msg.chat.username })
      user.count({}, (err, count) => {
        if (err) return;
        num = count
        bot.sendMessage(441672839, msg.from.first_name + ". username = " + msg.from.username + " Total num of user is " + count.toString())
      });
    }
    try {
      var countryCode;
      var countryName;
      var finder;
      if (exist == 1) {
        countryCode = text;
        countryName = countries[countryCode.toUpperCase()]
        //console.log(countryName);
      }
      else {
        countryCode = rev_country[text.toLowerCase()]
        countryName = text.toLowerCase()
      }
      finder = main[countryName];
      if (finder === undefined) {
        bot.sendMessage(msg.chat.id, `Please Enter correct Country name like <b>Ethipia, Italy , USA, or ET, IT,US</b>\n
                Created by: @chapimenge`, { parse_mode: "HTML" })
        return;
      }
      var findd = finder.toString()

      countryModel.findOne({ country: findd.substr(0, findd.length - 1) }, (err, docs) => {
        if (err) {
          bot.sendMessage(msg.chat.id, `Please Enter correct Country name like <b>Ethipia, Italy , USA, or ET, IT,US</b>\n
                Created by: @chapimenge`, { parse_mode: "HTML" })
          return
        }
        bot.sendMessage(msg.chat.id, `CoronaVirus covid-19 data of ${toTitleCase(docs.country)} - ${countryCode.toUpperCase()}: 
        Confirmed Case: <b>${docs.cases}</b> 
        Recovered:  <b>${docs.recovered}</b> 
        Death:  <b>${docs.deaths}</b>
        Total new cases today:  <b>${docs.todayCases}</b>
        Total new deaths today: <b>${docs.todayDeaths}</b>
        Total active cases :    <b>${docs.active}</b>
        Total serious cases :   <b>${docs.critical}</b>
This information last updated: ${docs.last_update}\n
Created by: @chapimenge`, { parse_mode: "HTML" })
      })
    } catch (error) {
      console.log(error);
      bot.sendMessage(msg.chat.id, "Our Server is down because of unexpected number of user rising like Covid. We will be back soon.\n\n try to contact @chapimenge")
    }
  } else {
    await bot.sendMessage(msg.chat.id, "Please send valid command to see example send me /start or start")

  }
});

function checkCountry(name) {
  // console.log("Entered");
  name = name.toUpperCase();
  for (var i in countries) {
    if (i === name) {
      return 1;
    }
  }
  name = name.toLowerCase();
  for (var i in countries) {
    if (countries[i] === name) {
      return 11;
    }
  }

  return 0;
}


async function updateWorld(todayDeaths) {
  try {
    console.log("Updating the world");

    const worldraw = await axios.get("https://coronavirus-19-api.herokuapp.com/all")
    const world_data = await worldraw.data
    world_data.last_update = new Date()
    if (todayDeaths !== -1) {
      world_data.todayDeaths = todayDeaths;
    }
    worldModel.findOneAndUpdate({ _id: "5e7855cf2a0d5c0b23937a2d" }, world_data, function (err, doc) {
      if (err) {
        console.log("Updating world error", err.message);
        return;
      }
    })
    console.log("Done Updating world data");
    return;
  } catch (error) {
    console.log("Error in Update world function", error.message);
    return;
  }
}

async function updatecountry() {
  console.log("Updating Country ");
  try {
    const countryraw = await axios.get("https://coronavirus-19-api.herokuapp.com/countries")
    const countrydata = await countryraw.data
    var lengthOfCountry = countrydata.length
    var totalTodayDeath = 0;
    for (let i = 0; i < lengthOfCountry; i++) {
      countryModel.findOneAndUpdate({ country: countrydata[i].country.toLowerCase() }, countrydata[i], { upsert: true }, (err, doc) => {
        if (err) {
          console.log("updating error");
          console.log(err.message);
          return;
        }
      })
      totalTodayDeath += countrydata[i].todayDeaths;
    }
    console.log("Today death is", totalTodayDeath);

    console.log("Done updating country");
    return totalTodayDeath;
  } catch (err) {
    console.log(err.message);
    return -1;
  }
}
cron.schedule('*/15 * * * *', async function () {
  console.log("Updating The Database");
  var deaths = await updatecountry();
  await updateWorld(deaths);
});
