
var util = require('util'),
   io = require('socket.io'),
   _ = require('underscore'),
   connect = require('connect'),
   http = require('http'),
   url = require('url'),
   fs = require('fs'),
   Twitter = require('twitter');

var twitter = new Twitter({
   consumer_key: 'qRnYzQj3dxTkxaFwkkiw',
   consumer_secret: 'CGcMlTKdP9HKVelHijPzvSb4EfmJxzHxEccuXENs',
   access_token_key: '59268061-xuB5Wo0b9kGewqP3pGxbstTDCZTKQ9RxRofwotqD5',
   access_token_secret: 'qWJkB3kHyP9vdRW7zQcXShsjGazbWxK4GuwFsFrlQIE'
});

var cache = 1000 * 60 * 60 * 24 * 5;
var server = connect.createServer(
   connect.logger(),
   connect.router(function (app) {

      app.get('/paul', function (req, res, next) {
         var reqUrl = url.parse(req.url, true);
//         res.end(util.inspect(reqUrl));
         if (reqUrl.query.s === 'log') {
            req.url = '/log.txt';
            next();
         }
      });

   }),
   connect.static(__dirname, {maxAge: cache})
);

server.listen(321);
var socket = io.listen(server);

var stats = {
      clients: 0,
      count: 0,
      perMin: 0,
      perHour: 0,
      perDay : 0,
      start: new Date().getTime()
   },
   cache = [];


socket.on('connection', function (client) {
   if (cache.length > 0)
      client.send(JSON.stringify(cache));

   client.on('message', function (data) {
      if (data === 'track') {
         stats.clients++;
         console.log('===== Page requests: '+ stats.clients);
      }
   });
});

var file = fs.createWriteStream(
   "./log.txt",
   { flags: 'w', enconding: 'utf8' }
);

twitter.stream('statuses/filter', {track: 'firefox 4, ff4, firefox4, fx4, ffx4'}, 
   function (hose) {

   hose.on('data', function (twiit) {
      stats.count++;

      // calculate rates
      var now = new Date().getTime(),
         time = now - stats.start,
         timeMinutes = time / (1000 * 60),
         timeHours = time / (1000 * 60 * 60),
         timeDays = time / (1000 * 60 * 60 * 24),
         count = stats.count,
         rateMin = count / timeMinutes,
         rateHour = count / timeHours,
         rateDays = count / timeDays;

      stats.perMin = rateMin.toFixed(3);
      stats.perHour = rateHour.toFixed(3);
      stats.perDay = rateDays.toFixed(3); 


      twiit.stats = stats;
      socket.broadcast(JSON.stringify(twiit));
      cache.unshift(twiit);
      cache = cache.slice(0, 25); // save the cache
      cache.reverse(); // latest at the top

      console.log('===== Twits containing firefox: '+ stats.count);

      file.write("\n\n"+
         twiit.text +"\n"+ twiit.user.screen_name +
         "\n"+ twiit.created_at +"\n"
      );
   });
});

