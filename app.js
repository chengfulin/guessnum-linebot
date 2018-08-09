const express = require('express');
const morgan = require('morgan');
const linebot = require('linebot');
const bodyParser = require("body-parser");

const bot = linebot({
    channelId: '<your-channel-id>',
    channelSecret: '<your-channel-secret>',
    channelAccessToken: '<your-channel-access-token>',
    verify: true // Verify 'X-Line-Signature' header (default=true) 
});

require("./config/database");

const app = express();
const linebotParser = bot.parser();
app.use(morgan('dev')); // log every request on console
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => { res.status(200).send("Hello! Guess Number 1A2B."); });

app.post('/', linebotParser);

const textMessageHandler = require('./app/TextMessageHandler');
bot.on('message', (event) => {
    textMessageHandler.process(event);
})

app.listen(process.env.PORT || 8080, () => {
    console.log('>> server is running on port ' + process.env.PORT || 8080);
});