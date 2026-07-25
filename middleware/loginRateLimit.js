import createRateLimiter from './rateLimit.js';

export default createRateLimiter({
    windowMs:    5 * 60 * 1000,
    maxAttempts: 5,
    message:     'Too many login attempts. Please try again in 5 minutes.'
});
