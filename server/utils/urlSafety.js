const dns = require('dns').promises;
const { URL } = require('url');

const PRIVATE_IP_RANGES = [
  /^127\./,                          // loopback
  /^10\./,                           // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./,     // Class B private
  /^192\.168\./,                     // Class C private
  /^169\.254\./,                     // link-local
  /^0\./,                            // current network
  /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./, // CGNAT
  /^198\.18\./,                      // benchmark testing
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 unique local
  /^fe80:/i,                         // IPv6 link-local
  /^fd/i,                            // IPv6 ULA
];

function isPrivateIP(ip) {
  return PRIVATE_IP_RANGES.some(r => r.test(ip));
}

/**
 * Check if a URL is safe to fetch (http/https + not targeting private networks).
 * Performs DNS resolution to prevent DNS rebinding attacks.
 */
async function isSafeUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    // Reject if hostname is an IP literal in private ranges
    if (isPrivateIP(parsed.hostname)) return false;

    // Resolve DNS and check the actual IP
    const { address } = await dns.lookup(parsed.hostname);
    if (isPrivateIP(address)) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Synchronous protocol-only check (for cases where async is not needed).
 */
function isSafeUrlProtocol(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

module.exports = { isSafeUrl, isSafeUrlProtocol, isPrivateIP };
