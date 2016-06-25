// lifted from https://github.com/dciccale/docker-angular-tutum/

'use strict';

var path = require('path');

module.exports = {
  // Environment
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(path.join(__dirname, '../..')),

  // Server port
  port: process.env.PORT || 9000,

  engineURL: process.env.ENGINE_URL || "http://localhost:2222"
};
