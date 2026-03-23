'use strict';

/**
 * sub-procedure service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sub-procedure.sub-procedure');
