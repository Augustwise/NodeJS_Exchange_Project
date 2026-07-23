const createRateLimiter = require('./rateLimit');

module.exports = createRateLimiter({
    windowMs:    60 * 60 * 1000,
    maxAttempts: 10,
    message:     'Too many registration attempts. Please try again later.'
});
