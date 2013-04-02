/**
 * @fileOverview
 *
 * SimpleCluster class definition.
 */

var EventEmitter = require("events").EventEmitter;
var util = require("util");
var redis = require("redis");
var uuid = require("node-uuid");

//-----------------------------------------------------------
// Class definition.
//-----------------------------------------------------------

/**
 * @class
 *
 * Manages communication between processes via Redis pub/sub. Use the methods
 * to send messages, which are then emitted from the singleton SimpleCluster
 * instances in other processes.
 *
 * @param {object} options
 *   The options for the SimpleCluster instance.
 */
function SimpleCluster (options) {
  options = options || {};
  // Set defaults.
  this.id = options.id || uuid.v1();
  this.channel = options.channel || "simpleCluster:channel";
  // Default pub/sub clients to localhost and the standard Redis port.
  this.pub = options.pubClient || redis.createClient();
  this.sub = options.subClient || redis.createClient();
  // Sign up for channel messages.
  this.sub.subscribe(this.channel);
  // React to channel messages.
  var self = this;
  this.sub.on("message", function (channel, json) {
    var data;
    try {
      data = JSON.parse(json);
    } catch (e) {}
    if (data) {
      if (!data._ignoreIfSender || data._from !== self.id) {
        self.emit(data._name, data);
      }
    }
  });
}
util.inherits(SimpleCluster, EventEmitter);
var p = SimpleCluster.prototype;

/**
 * Send data to all processes in the cluster, causing an event to be emitted
 * by the simpleCluster singleton in each process.
 *
 * @param {string} name
 *   The event to be emitted.
 * @param {object} data
 *   Data passed with the event.
 * @param {function} callback
 *   Of the form function (error).
 */
p.sendToAll = function (name, data, callback) {
  data = data || {};
  data._from = this.id;
  data._name = name;
  this.pub.publish(this.channel, JSON.stringify(data), callback);
};

/**
 * Send data to all processes in the cluster, causing an event to be emitted
 * by the simpleCluster singleton in each process except this one.
 *
 * @param {string} name
 *   The event to be emitted.
 * @param {object} data
 *   Data passed with the event.
 * @param {function} callback
 *   Of the form function (error).
 */
p.sendToOthers = function (name, data, callback) {
  data = data || {};
  data._ignoreIfSender = true;
  this.sendToAll(name, data, callback);
};

//-----------------------------------------------------------
// Exports: Class constructor.
//-----------------------------------------------------------

module.exports = SimpleCluster;
