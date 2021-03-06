'use strict';

const requestLib = require('request');
const throttled = require('throttled-request')(requestLib);
const debug = require('debug')('google-play-scraper');

function doRequest (opts, limit) {
  let req = requestLib;
  if (limit) {
    throttled.configure({
      requests: limit,
      milliseconds: 1000
    });
    req = throttled;
  }

  return new Promise((resolve, reject) => req(opts, function (error, response, body) {
    error ? reject(error) : resolve(body);
  }));
}

function request (opts, limit) {
  debug('Making request: %j', opts);
  return doRequest(opts, limit)
    .then(function (response) {
      debug('Request finished');
      return response;
    })
    .catch(function (reason) {
      debug('Request error:', reason.message, reason.response && reason.response.statusCode);

      if (reason.response && reason.response.statusCode === 404) {
        throw Error('App not found (404)');
      }
      throw Error('Error requesting Google Play:' + reason.message);
    });
}

module.exports = request;
