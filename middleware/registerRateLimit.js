import createRateLimiter from './rateLimit.js';

export default createRateLimiter({
    windowMs:    60 * 60 * 1000,
    maxAttempts: 10,
    message:     'Too many registration attempts. Please try again later.'
});
