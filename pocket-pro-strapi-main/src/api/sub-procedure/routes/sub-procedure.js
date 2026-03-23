'use strict';

/**
 * sub-procedure router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::sub-procedure.sub-procedure');
