const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  // After routing works
  await next();

  clearHash(req.user.id);
};
