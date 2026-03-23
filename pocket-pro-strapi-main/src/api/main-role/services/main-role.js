'use strict';

/**
 * main-role service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::main-role.main-role');
