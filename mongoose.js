'use strict';
const config = require('config')

/**
 * Wrapper for mongoose
 */

const mongoose = require('mongoose');

module.exports = {
  connect: async () => {
    const url = config.get('db.connection_string');
    console.log("url : ", url);
    return mongoose.connect(url);
  },
  disconnect: async () => mongoose.disconnect(),
  mongoose
};
