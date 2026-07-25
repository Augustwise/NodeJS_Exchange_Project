// middleware/csrf.js — synchronizer-token CSRF protection for HTML form POSTs.
//
// csrfToken   — runs on every request; creates a per-session token for
//               logged-in users and exposes it to views as `csrfToken`.
// verifyCsrf  — guards state-changing form routes; rejects requests whose
//               `_csrf` body field does not match the session token.

import crypto from 'crypto';

function csrfToken(req, res, next) {
    if (req.session.userId && !req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    res.locals.csrfToken = req.session.csrfToken || '';
    next();
}

function verifyCsrf(req, res, next) {
    const sent     = req.body && req.body._csrf;
    const expected = req.session.csrfToken;

    const valid = typeof sent === 'string'
        && typeof expected === 'string'
        && sent.length === expected.length
        && crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(expected));

    if (!valid) {
        return res.status(403).send('Invalid or missing CSRF token.');
    }

    next();
}

export { csrfToken, verifyCsrf };
