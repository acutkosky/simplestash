var express = require('express');
var redis = require('redis');

var randomUrl = require('./randomUrl');

var app = express();


var hostname = (process.env.HOST || 'localhost')
var port = (process.env.PORT || 5000);
var redisURL = (process.env.REDIS_URL || undefined);

var client = redis.createClient(redisURL);

client.on("error", function (err) {
    console.log("Error " + err);
});

console.log("port: ", port);

app.set('port', port);

app.get('/', (req, res) => {
  res.send('hello world!');
});


var stashedData = {};
var keyLength = 10
var defaultTimeoutSeconds = 3000 // 5 minutes
function getKey() {
  key = randomUrl(10);
  return key;
}

app.get('/stash/:toStash', (req, res) => {
  key = getKey();
  client.set(key, req.params.toStash, "EX", defaultTimeoutSeconds, (err) => {
    if (err) {
      res.status(500).send("Stashing Error!");
    } else {
      res.send({key})
    }
  });
});

app.get('/unstash/:key', (req, res) => {
  client.get(req.params.key, (err, value) => {
    if (err) {
      res.status(500).send("Unstashing Error!");
    } else {
      res.send({value})
    }
  });
  // res.send({value: stashedData[req.params.key]});
});


var server = app.listen(app.get('port'), app.get('hostname'), () => {
  console.log(
    `Server running at http://${app.get('hostname')}:${app.get('port')}/`);
});