const app = require('../server/index');
const db = require('../server/db');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await db.init();
      isInitialized = true;
    } catch (err) {
      console.error('Error initializing db in serverless function:', err);
    }
  }
  return app(req, res);
};
