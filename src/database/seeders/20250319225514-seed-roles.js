'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      { name: 'super_admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'customer', createdAt: new Date(), updatedAt: new Date() },
      { name: 'service_provider', createdAt: new Date(), updatedAt: new Date() },
      { name: 'service_provider_assistant', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};