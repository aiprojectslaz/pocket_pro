'use strict';

/**
 * definition service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::definition.definition');
