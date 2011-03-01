
var sys = require('sys'),
   io = require('socket.io'),
   _ = require('underscore'),
   connect = require('connect'),
   http = require('http'),
   fs = require('fs'),
   Twitter = require('twitter');

var twitter = new Twitter({
   consumer_key: 'qRnYzQj3dxTkxaFwkkiw',
   consumer_secret: 'CGcMlTKdP9HKVelHijPzvSb4EfmJxzHxEccuXENs',
   access_token_key: '59268061-xuB5Wo0b9kGewqP3pGxbstTDCZTKQ9RxRofwotqD5',
   access_token_secret: 'qWJkB3kHyP9vdRW7zQcXShsjGazbWxK4GuwFsFrlQIE'
});

var server = connect.createServer(
   connect.conditionalGet(),
   connect.cache(),
   connect.gzip(),
   connect.staticProvider(__dirname)
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

twitter.stream('statuses/filter', {track: 'firefox 4, ff4, firefox4'}, 
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
         rateMin = timeMinutes / count,
         rateHour = timeHours / count,
         rateDays = timeDays / count;

      stats.perMin = rateMin;
      stats.perHour = rateHour;
      stats.perDay = rateDays; 


      twiit.stats = stats;
      socket.broadcast(JSON.stringify(twiit));
      cache.push(twiit);
      cache = cache.slice(0, 25); // save the cache

      console.log('===== Twits containing firefox: '+ stats.count);
   });
});

