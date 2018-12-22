var express = require('express');
var bodyParser = require('body-parser');
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

app.use(bodyParser.json());

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

function setData(key, data, timeoutSeconds, res) {
  client.set(key, data, "EX", timeoutSeconds, (err) => {
    if (err) {
      res.status(500).send("Stashing Error!");
    } else {
      res.send({key})
    }
  });
}

app.get('/stash/:toStash', (req, res) => {
  key = getKey();
  timeoutSeconds = req.query.t || defaultTimeoutSeconds;
  data = JSON.stringify({data: req.params.toStash});
  setData(key, data, timeoutSeconds, res);
});

app.post('/stash', (req, res) => {
  key = getKey();
  timeoutSeconds = req.body.timeoutSeconds || defaultTimeoutSeconds;
  data = JSON.stringify({data: req.body.data});
  setData(key, data, timeoutSeconds, res); 
})

app.get('/unstash/:key', (req, res) => {
  client.get(req.params.key, (err, data) => {
    if (err) {
      res.status(500).send("Unstashing Error!");
    } else {
      if (data === null) {
        res.send({});
      } else {
        res.send(JSON.parse(data));
      }
    }
  });
});


var server = app.listen(app.get('port'), app.get('hostname'), () => {
  console.log(
    `Server running at http://${app.get('hostname')}:${app.get('port')}/`);
});