/* Author: Sean Caetano Martin
      aka xonecas

   http://xonecas.com/

*/

function addTweet (tweet) {
   var stats = tweet.stats, 
      name = tweet.user.screen_name,
      time = new Date(tweet.created_at),
      timeStr = 'on '+ time.toDateString() +
         'at '+ time.toTimeString();


   $('#count').html(tweet.stats.count);
   $('#min_rate').html(stats.perMin);
   $('#hour_rate').html(stats.perHour);
   $('#day_rate').html(stats.perDay);

   $('#list li:first-child').before(
'<li class="tweet clearfix">'+
'   <img src="'+ tweet.user.profile_image_url +'" />'+
'   <div class="text">'+ tweet.text +'</div>'+
'   <div class="meta">'+
'      <a href="//twitter.com/'+name+
         '" target="_new" class="name">By '+name +'</a>'+
'      <span class="time">'+ timeStr +'</span>'+
'   </div>'+
'</li>'
   );
   $('.tweet:hidden').slideDown('slow');
   $('#list').html($('.tweet').slice(0,25));
}

var socket = new io.Socket('xonecas.com');
socket.connect();

socket.on('connect', function () {
   socket.send('track');
});

socket.on('message', function (data) {
   var resp = $.parseJSON(data);

   if (resp instanceof Array) 
      for (var i=0; i < resp.length; i++)
         addTweet(resp[i]);
   else
      addTweet(resp);
});











