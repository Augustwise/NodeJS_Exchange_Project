const attempts = new Map();

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

module.exports = function loginRateLimit(req, res, next) {
    const ip = req.ip;
    const now = Date.now();
    const entry = attempts.get(ip);

    if (!entry || entry.expiresAt <= now) {
        attempts.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
        return next();
    }

    if (entry.count >= MAX_ATTEMPTS) {
        return res.status(429).json({
            ok: false,
            message: 'Too many login attempts. Please try again in 5 minutes.'
        });
    }

    entry.count += 1;
    return next();
};
