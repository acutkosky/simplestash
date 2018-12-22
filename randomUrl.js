
var crypto = require('crypto');

function randomUrl(length) {
  randomNonUrl = crypto.randomBytes(length).toString('base64');
  return randomNonUrl.replace(/\//g, '_').replace(/\+/g, '_');
}

module.exports = randomUrl;