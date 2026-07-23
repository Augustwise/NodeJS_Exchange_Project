// middleware/rateLimit.js — factory for simple per-IP fixed-window rate limiters.

function createRateLimiter({ windowMs, maxAttempts, message }) {
    const attempts = new Map();

    const sweeper = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of attempts) {
            if (entry.expiresAt <= now) {
                attempts.delete(key);
            }
        }
    }, windowMs);
    sweeper.unref();

    function limiter(req, res, next) {
        const key   = req.ip;
        const now   = Date.now();
        const entry = attempts.get(key);

        if (!entry || entry.expiresAt <= now) {
            attempts.set(key, { count: 1, expiresAt: now + windowMs });
            return next();
        }

        if (entry.count >= maxAttempts) {
            return res.status(429).json({ ok: false, message });
        }

        entry.count += 1;
        return next();
    }

    // Clears the counter for the given key (called on successful login).
    limiter.reset = (key) => attempts.delete(key);

    return limiter;
}

module.exports = createRateLimiter;
