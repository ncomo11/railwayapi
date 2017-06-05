var TelegramBot = require('node-telegram-bot-api');
var railway = require('railway-api');
var http = require('http');
var token = '352590617:AAHLXirIAbvh2B_60zX49KOCr3hj5y5Bh1U';
var apikey = "magouare";
railway.setApikey(apikey);

var options = {
  host: 'api.railwayapi.com',
  port: 80
};

var bot = new TelegramBot(token, {polling: true});
bot.getMe().then(function (me) {
  console.log('Hi my name is %s!', me.username);
});

//matches /start
bot.onText(/\/start/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var message = "Welcome to your Railway Enquiry Bot\n"
  message += "Get Indian railway related queries answered. To know more send /help command."
  bot.sendMessage(fromId, message);
});

bot.onText(/\/help/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var postcode = match[1];
  var message = "I can help in getting the below queries:\n"
                + "1. /pnr [pnr_number]\n"
                + "2. /find-station [station_name]\n"
                + "3. /find-train [train name or number]\n"
                + "4. /avail [train_no] [source] [dest] [date] [class_code] [quota_code]\n"
                + "5. /live [train_number]\n";
  bot.sendMessage(fromId, message);
});

//match /pnr [pnr_number]
bot.onText(/\/pnr (.+)/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var pnr = match[1];
  var message = "Fetching current status for PNR: "+pnr;
  options.path = "/pnr_status/pnr/"+pnr+"/apikey/"+apikey;
  http.get(options, function(resp){
    resp.setEncoding('utf8');
    resp.on('data', function(chunk){
      //do something with chunk
      console.log(chunk);
    });
  }).on("error", function(e){
    console.log("Got error: " + e.message);
    bot.sendMessage(fromId, "Error while fetching PNR status:"+e.message);
  });
});

//get station code for station name
bot.onText(/\/find-station (.+)/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var station = match[1];
  var message = "No match found for code: "+station;
  railway.stationCode(station, function (err, res) {
    JSON.parse(res).stations.forEach(function(element) {
      if(element.fullname.indexOf(station.toUpperCase()) > -1)
        {
          message = "Code: "+element.code
                        + "\nStation: "+element.fullname
                        + "\nState: "+element.state;
          return;
        }
    }, this);
    bot.sendMessage(fromId, message);
  });
});

//find train code providing the train name
bot.onText(/\/find-train (.+)/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var train = match[1];
  var message = "No match found for train: "+train;
  railway.name_number(train, function (err, res) {
     var result = res.train;
     if(result.name.length >0 && result.number.length >0 )
     {
        var runningDays ="";
        result.days.forEach(function(element){
            if(element['runs'] == "Y")
              runningDays += element['day-code'] + " - ";
        },this);
        message = "Train: "+result.name
               +"\nNumber: "+result.number
               +"\nRunning on: "+runningDays;
     }
     bot.sendMessage(fromId, message);
    }, this);
    
  });

  //find availability of train
  // /avail '<trainNo>' '<source>' '<destination>' '<date>' '<class>' '<quota>'
/*bot.onText(/\/avail (.+)/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var query = match[1].split(" ");
  var message = "No match found.";
  railway.seatAvailability (query[0], query[1], query[2], query[3], query[4], query[5], function (err, res) {
     var result = res.train;
    
    }, this);
    
  });*/

/*bot.onText(/\/live (.+)/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var train = match[1];
  var message = "No match found.";
  railway.liveTrainStatus (train, function (err, res) {
     var result = res.train;
    
    }, this);
    
  });*/
