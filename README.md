Simple Cluster
==============

This package provides an exceedingly simple Redis-backed method of passing
data between processes running in a cluster, with an Express middleware wrapper
to make it easy to add to Express applications.

Set it up as follows:

    var http = require("http");
    var express = require("express");
    var redis = require("redis");
    var simpleCluster = require("simple-cluster");
    // Set the options - all of which are optional.
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

Now that you have a running instance in a process, you can listen on it for
messages from other processes:

    // Set up an example listener. Arbitrary event names can be used.
    instance.on("exampleEventName", function (data) {
      // Take action.
    });

For example, if using it via express:

    // Add to an Express application.
    app.use(simpleCluster.middleware());
    // Any GET request will result in the simpleCluster singleton object in all
    // processes emitting.
    app.get("*", function (req, res, next) {
      // Send a message to all processes, including this one. Any event name
      // can be used.
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
