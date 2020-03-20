

const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const axios = require('axios')
const options = {
  polling: true
};
const bot = new TelegramBot("913957091:AAEa5aAq4WYxuzYyEQ1gyh2CKDAuczZX4BU", options);


// Matches /photo
bot.onText(/world/ig, async function onPhotoText(msg) {
  
  try{
    var worldCovidData = await axios.get('https://covid19.mathdro.id/api');
    console.log(worldCovidData.data.confirmed.value)
    bot.sendMessage(msg.chat.id, "World Covid Data is loading\n please wait ...");
    bot.sendMessage(msg.chat.id, `Coronavirus COVID-19 Global Cases by the Center for Systems Science and Engineering (CSSE)\n 
The confirmed Case is ${worldCovidData.data.confirmed.value}\n
Recovered Patient is ${worldCovidData.data.recovered.value}\n and 
${worldCovidData.data.deaths.value} deaths.`) 


  }catch(err){
    console.log(err.message)
    bot.sendMessage(msg.chat.id, `There is Network Error from our Server please try later!\n
    or Try Contact @chapimenge3`)
  }
  // var data = JSON.parse()
});


// Matches /any word other than world
bot.onText(/^((?!world).)*$/gim, function onAudioText(msg) {
  // From HTTP request
  const url = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';
  const audio = request(url);
  bot.sendMessage(msg.chat.id, "The  is...");
});


// Matches /love
bot.onText(/\/love/, function onLoveText(msg) {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yes, you are the bot of my life ❤'],
        ['No, sorry there is another one...']
      ]
    })
  };
  bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
});


// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
  const resp = match[1];
  bot.sendMessage(msg.chat.id, resp);
});


// Matches /editable
bot.onText(/\/editable/, function onEditableText(msg) {
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Edit Text',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'edit'
          }
        ]
      ]
    }
  };
  bot.sendMessage(msg.from.id, 'Original Text', opts);
});


// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text;

  if (action === 'edit') {
    text = 'Edited Text';
  }

  bot.editMessageText(text, opts);
});