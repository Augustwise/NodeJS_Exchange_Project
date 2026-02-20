// utils/dateUtils.js — helper functions for working with dates.
//
// The app accepts dates from users in DD.MM.YYYY format (European style)
// but MySQL stores them as YYYY-MM-DD.  These two functions convert between
// the two formats so the rest of the code doesn't have to think about it.

/**
 * Converts a user-entered date string to the YYYY-MM-DD format that MySQL expects.
 * Accepts both "DD.MM.YYYY" (from the registration form) and "YYYY-MM-DD".
 * Returns null if the input is missing or unrecognised.
 */
function parseDate(dateStr) {
    if (!dateStr) return null;

    // "31.12.1990" → "1990-12-31"
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`;
    }

    // "1990-12-31" → already correct, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }

    return null; // unrecognised format
}

/**
 * Converts a date from MySQL (YYYY-MM-DD or a Date object) to display format DD.MM.YYYY.
 * Returns an empty string if the input is missing.
 */
function formatDate(dateInput) {
    if (!dateInput) return '';

    const date  = new Date(dateInput);
    const day   = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year  = date.getUTCFullYear();

    return `${day}.${month}.${year}`;
}

module.exports = { parseDate, formatDate };
