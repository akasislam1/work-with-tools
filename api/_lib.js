/* Shared helpers for the admin login and GitHub proxy (Vercel serverless functions, plain Node, no packages). */
const crypto = require('crypto');

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b)); // constant time, length-independent
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b64 = (buf) => Buffer.from(buf).toString('base64url');

/* Settings live in Vercel > Project > Settings > Environment Variables */
function env() {
  const e = process.env;
  const missing = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'GITHUB_TOKEN', 'GITHUB_REPO'].filter((k) => !e[k]);
  if (missing.length) return { ok: false, error: 'Admin is not set up yet. In Vercel, add these environment variables and redeploy: ' + missing.join(', ') + '.' };
  if (String(e.ADMIN_PASSWORD).length < 10) return { ok: false, error: 'ADMIN_PASSWORD must be at least 10 characters long.' };
  const repo = String(e.GITHUB_REPO).trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/\/+$/, '');
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return { ok: false, error: 'GITHUB_REPO must look like "username/repo".' };
  return { ok: true, user: e.ADMIN_USERNAME, pass: e.ADMIN_PASSWORD, token: e.GITHUB_TOKEN, repo, branch: (e.GITHUB_BRANCH || '').trim() };
}

function send(res, status, obj, headers) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  Object.keys(headers || {}).forEach((k) => res.setHeader(k, headers[k]));
  res.end(JSON.stringify(obj));
}

/* Session = signed, expiring cookie. The signing key is derived from the credentials, so changing the password signs everyone out. */
const key = (cfg) => sha('wt-session|' + cfg.user + '|' + cfg.pass + '|' + cfg.token);
function makeSession(cfg, seconds) {
  const payload = b64(JSON.stringify({ u: cfg.user, exp: Date.now() + seconds * 1000 }));
  const sig = b64(crypto.createHmac('sha256', key(cfg)).update(payload).digest());
  return payload + '.' + sig;
}
function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}
function readSession(req, cfg) {
  const v = cookies(req).wt_admin;
  if (!v || v.indexOf('.') < 0) return null;
  const [payload, sig] = v.split('.');
  const good = b64(crypto.createHmac('sha256', key(cfg)).update(payload).digest());
  const a = Buffer.from(sig || ''), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch (e) { return null; }
}
const cookieHeader = (value, seconds) =>
  'wt_admin=' + value + '; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=' + seconds;

/* Cross-site pages cannot add a custom header without our permission, which blocks CSRF */
const hasAdminHeader = (req) => req.headers['x-wt-admin'] === '1';

function readBody(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string' && b) { try { return JSON.parse(b); } catch (e) { return {}; } }
  return {};
}
function query(req, name) {
  if (req.query && req.query[name] !== undefined) return String(req.query[name]);
  try { return new URL(req.url, 'http://x').searchParams.get(name) || ''; } catch (e) { return ''; }
}

module.exports = { env, send, sleep, safeEqual, makeSession, readSession, cookieHeader, hasAdminHeader, readBody, query };
