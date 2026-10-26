/* POST /api/hit   {t:'pv'|'use'|'dl', p:'/merge-pdf/', r:'referrer'}
   Records one anonymous event. No cookies, no IP address is stored: a visitor is a hash of
   (IP + browser + today's date + a secret) that is only used to count unique visitors per day. */
const crypto = require('crypto');
const L = require('./_lib');
const R = require('./_redis');

const done = (res, code) => { res.statusCode = code || 204; res.setHeader('Cache-Control', 'no-store'); res.end(); };
const BOT = /bot|crawl|spider|headless|lighthouse|preview|slurp|facebookexternalhit|pingdom|uptime/i;

/* Which tool pages exist? Read from the live assets/tools.js (cached) so nobody can fill the database with made-up names. */
let cache = { at: 0, set: null };
async function knownSlugs() {
  if (Date.now() - cache.at < 5 * 60 * 1000) return cache.set;
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  let set = null;
  if (host) {
    try {
      const src = await (await fetch('https://' + host + '/assets/tools.js', { cache: 'no-store' })).text();
      const m = /window\.TOOLS\s*=\s*/.exec(src);
      if (m) {
        let depth = 0, str = false, esc = false;
        for (let j = m.index + m[0].length; j < src.length; j++) {
          const c = src[j];
          if (str) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') str = false; continue; }
          if (c === '"') str = true; else if (c === '[' || c === '{') depth++;
          else if (c === ']' || c === '}') { depth--; if (depth === 0) { set = new Set(JSON.parse(src.slice(m.index + m[0].length, j + 1)).map((t) => t.slug)); break; } }
        }
      }
    } catch (e) { set = null; }
  }
  cache = { at: Date.now(), set };
  return set;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return done(res, 405);
  if (!R.conf()) return done(res); // storage not connected yet: visitors never see an error
  const b = L.readBody(req);
  const type = b.t;
  if (type !== 'pv' && type !== 'use' && type !== 'dl') return done(res, 400);
  const ua = String(req.headers['user-agent'] || '');
  if (!ua || BOT.test(ua)) return done(res);

  const path = String(b.p || '/').slice(0, 80);
  let slug = null;
  if (path !== '/') {
    const m = /^\/([a-z0-9-]{1,60})\/?$/.exec(path);
    if (!m) return done(res);
    slug = m[1];
    const known = await knownSlugs();
    if (known && !known.has(slug)) return done(res);
  }
  if (type !== 'pv' && !slug) return done(res, 400);

  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || '';
  const secret = process.env.ANALYTICS_SALT || process.env.ADMIN_PASSWORD || 'wt';
  const vid = crypto.createHash('sha256').update(secret + '|' + day + '|' + ip + '|' + ua).digest('hex').slice(0, 32);
  const field = (slug || 'home') + '|' + type;
  const cmds = [['HINCRBY', 'wt:tool:' + day, field, 1]];

  if (type === 'pv') {
    const cc = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
    const dev = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
    let ref = 'direct';
    try {
      const u = new URL(String(b.r || ''));
      const own = String(req.headers.host || '').toLowerCase();
      const rh = u.hostname.replace(/^www\./, '').toLowerCase();
      if (rh && rh !== own.replace(/^www\./, '')) ref = rh.slice(0, 60);
    } catch (e) { /* no referrer */ }
    cmds.push(['INCR', 'wt:pv:' + day], ['PFADD', 'wt:vis:' + day, vid],
      ['HINCRBY', 'wt:cc:' + day, /^[A-Z]{2}$/.test(cc) ? cc : '??', 1],
      ['HINCRBY', 'wt:dev:' + day, dev, 1], ['HINCRBY', 'wt:ref:' + day, ref, 1]);
  }
  try { await R.pipeline(cmds); } catch (e) { console.error('hit failed:', e.message); }
  return done(res);
};
