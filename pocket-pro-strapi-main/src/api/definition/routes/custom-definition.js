"use strict";

/**
 * procedure controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::procedure.procedure', ({ strapi }) => ({
  
  async findDefinitions(ctx) {
    // Your logic to find definitions goes here
    return "to be implemented";
  },

}));
