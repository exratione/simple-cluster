/**
 * @fileOverview
 *
 * An example of use for simple-cluster with Express.js. A port can be passed
 * in, or it will default to 10080.
 *
 * Usage: node example/express 10080
 */

var http = require("http");
var express = require("express");
var redis = require("redis");
var simpleCluster = require("simple-cluster");

var options = {
  // String. Override the UUID of this process if set.
  id: undefined,
  // String. Override the Redis channel name used for pub/sub communication.
  channel: undefined,
  // A Redis client for publishing. If not provided, it defaults to trying
  // to connect to a local Redis instance.
  pubClient: redis.createClient(),
  // A Redis client for subscribing. If not provided, it defaults to trying
  // to connect to a local Redis instance.
  subClient: redis.createClient()
};

// Start things running.
var instance = simpleCluster.start(options);
// Set up an example listener. Arbitrary event names can be used.
instance.on("exampleEventName", function (data) {
  console.log("Request with path: " + data.path + " at timestamp: " + data.timestamp);
});

// Then make the simple-cluster functionality available in Express. Here any
// GET request to any process running this example code will result in the
// simpleCluster object in all processes emitting.
var app = express();
app.use(simpleCluster.middleware());
app.get("*", function (req, res, next) {
  req.simpleCluster.sendToAll("exampleEventName", {
    path: req.path,
    timestamp: Date.now()
  }, function (error) {
    if (error) {
      next(error);
    } else {
      res.send(200);
    }
  });
});

// Pull the port from the arguments or default it.
var port;
if (process.argv.length > 2) {
  port = parseInt(process.argv[2], 10);
}
if (!port || isNaN(port) || port < 0) {
  port = 10080;
}
http.createServer(app).listen(port);
