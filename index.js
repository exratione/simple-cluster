/**
 * @fileOverview
 *
 * Main module file for the simple-cluster package.
 *
 * For an example of use, see /example/express.js.
 */

var SimpleCluster = require("./lib/simpleCluster");

/**
 * Start the cluster code running.
 *
 * @param {object} [options]
 *   Options, none of which are required.
 * @return {SimpleCluster}
 *   The SimpleCluster instance.
 */
exports.start = function (options) {
  if (!exports.instance) {
    exports.instance = new SimpleCluster(options);
  }
  return exports.instance;
};

/**
 * Express middleware that exposes the simple-cluster functionality to
 * request functions.
 *
 * @param  {object} [options]
 *   Options, none of which are required.
 * @return {Function}
 *   The middleware function.
 */
exports.middleware = function (options) {
  var simpleCluster = exports.start(options);
  return function (req, res, next) {
    req.simpleCluster = res.simpleCluster = req.app.simpleCluster = simpleCluster;
    next();
  };
};
