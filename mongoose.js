'use strict';

/**
 * Wrapper for mongoose
 */

const mongoose = require('mongoose');

module.exports = {
  connect: async () => {
    const url = `mongodb://localhost:27017/execute`;
    console.log("url : ", url);
    return mongoose.connect(url);
  },
  disconnect: async () => mongoose.disconnect(),
  mongoose
};
