"use strict";

/**
 * procedure controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::procedure.procedure', ({ strapi }) => ({
  
  async findSubProcedures(ctx) {
    // Your logic to find sub-procedures goes here
    return "to be implemented";
  },

}));
