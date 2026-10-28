/* /api/acct  -  accounts, free-plan limits and manual payments (screenshot + approval).
   One file on purpose. Everything is stored in the same Upstash Redis database used for analytics.

   Visitors / members : plans, me, signup, login, logout, use, methods, pay, mypay
   Admin (owner only) : a_cfg, a_savecfg, a_pay, proof, a_decide, a_users, a_grant, a_revoke, a_resetpw, a_testmail */
const crypto = require('crypto');
const util = require('util');
const L = require('./_lib');
const R = require('./_redis');

const scrypt = util.promisify(crypto.scrypt);
const DAY = 86400000;
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const secret = () => process.env.SESSION_SECRET || process.env.GITHUB_TOKEN || process.env.ADMIN_PASSWORD || '';
const run = (cmds) => R.pipeline(cmds);
const one = async (cmd) => (await run([cmd]))[0];

/* ------------------------------------------------------------------ settings */
const DEFAULTS = {
  enforce: true, currency: 'USD',
  limits: { maxFilesBatch: 20, maxFileMB: 25, maxFilesDay: 80 },
  plans: { monthly: { label: 'Monthly', price: '4.99', days: 30 }, yearly: { label: 'Yearly', price: '39.99', days: 365 } },
  methods: [], intro: '', notifyEmail: '', contact: ''
};
function cleanCfg(c) {
  c = c || {};
  const num = (v, d, min, max) => { v = Number(v); return Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : d; };
  const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
  const price = (v, d) => { const s = String(v == null ? '' : v).trim(); return /^\d{1,6}(\.\d{1,2})?$/.test(s) && Number(s) > 0 ? s : d; };
  const lim = c.limits || {};
  const out = {
    enforce: c.enforce !== false,
    currency: str(c.currency, 8) || DEFAULTS.currency,
    limits: {
      maxFilesBatch: num(lim.maxFilesBatch, DEFAULTS.limits.maxFilesBatch, 1, 500),
      maxFileMB: num(lim.maxFileMB, DEFAULTS.limits.maxFileMB, 1, 2000),
      maxFilesDay: num(lim.maxFilesDay, DEFAULTS.limits.maxFilesDay, 1, 10000)
    },
    plans: {}, methods: [], intro: str(c.intro, 600), notifyEmail: str(c.notifyEmail, 120), contact: str(c.contact, 120)
  };
  ['monthly', 'yearly'].forEach((k) => {
    const p = (c.plans && c.plans[k]) || {}, d = DEFAULTS.plans[k];
    out.plans[k] = { label: str(p.label, 30) || d.label, price: price(p.price, d.price), days: num(p.days, d.days, 1, 3650) };
  });
  out.methods = (Array.isArray(c.methods) ? c.methods : []).slice(0, 10).map((m) => ({
    id: str(m && m.id, 16).replace(/[^a-z0-9]/gi, '') || crypto.randomBytes(4).toString('hex'),
    name: str(m && m.name, 40), detail: str(m && m.detail, 400), note: str(m && m.note, 300)
  })).filter((m) => m.name && m.detail);
  return out;
}
let cfgCache = { t: 0, v: null };
async function getCfg(fresh) {
  if (!fresh && cfgCache.v && Date.now() - cfgCache.t < 20000) return cfgCache.v; // saves database reads on busy pages
  const raw = await one(['GET', 'wt:cfg']);
  let parsed = null;
  try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
  cfgCache = { t: Date.now(), v: cleanCfg(parsed) };
  return cfgCache.v;
}
const available = (cfg) => cfg.methods.length > 0;
const enforcing = (cfg) => cfg.enforce && available(cfg);

/* ------------------------------------------------------------------ helpers */
const bad = (res, status, message, code) => L.send(res, status, { code: code || 'error', message });
const cookiesOf = (req) => {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
  return out;
};
const ipOf = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || '';
const day = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
const normEmail = (e) => String(e || '').trim().toLowerCase();
const validEmail = (e) => e.length <= 120 && /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(e);
const validSlug = (s) => /^[a-z0-9-]{1,60}$/.test(String(s || ''));

async function rateLimit(key, max, seconds) {
  const r = await run([['INCR', key], ['EXPIRE', key, seconds]]);
  return Number(r[0]) <= max;
}

/* passwords: scrypt with a random salt */
async function hashPw(pw) {
  const salt = crypto.randomBytes(16);
  const h = await scrypt(String(pw), salt, 32);
  return 's1$' + salt.toString('base64url') + '$' + h.toString('base64url');
}
async function checkPw(pw, stored) {
  const p = String(stored || '').split('$');
  if (p.length !== 3 || p[0] !== 's1') return false;
  const h = await scrypt(String(pw), Buffer.from(p[1], 'base64url'), 32);
  const want = Buffer.from(p[2], 'base64url');
  return want.length === h.length && crypto.timingSafeEqual(h, want);
}

/* member session = signed cookie (30 days). It stops working if the password is changed or reset. */
const signKey = () => crypto.createHash('sha256').update('wt-user|' + secret()).digest();
function makeSession(user) {
  const payload = Buffer.from(JSON.stringify({ e: user.email, x: Date.now() + 30 * DAY, k: user.ph.slice(-10) })).toString('base64url');
  return payload + '.' + crypto.createHmac('sha256', signKey()).update(payload).digest('base64url');
}
const sessionCookie = (v, seconds) => 'wt_user=' + v + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=' + seconds;
async function currentUser(req) {
  const v = cookiesOf(req).wt_user;
  if (!v || v.indexOf('.') < 0) return null;
  const [payload, sig] = v.split('.');
  const good = crypto.createHmac('sha256', signKey()).update(payload).digest('base64url');
  const a = Buffer.from(sig || ''), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let data;
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch (e) { return null; }
  if (!data || data.x < Date.now()) return null;
  const raw = await one(['GET', 'wt:user:' + data.e]);
  if (!raw) return null;
  let user;
  try { user = JSON.parse(raw); } catch (e) { return null; }
  return user.ph && user.ph.slice(-10) === data.k ? user : null;
}
const isPremium = (u) => !!u && Number(u.until) > Date.now();
const publicUser = (u) => (u ? { email: u.email, premium: isPremium(u), until: Number(u.until) || 0 } : null);
const saveUser = (u) => one(['SET', 'wt:user:' + u.email, JSON.stringify(u)]);

/* ------------------------------------------------------------------ email (optional) */
function mailProvider() {
  const e = process.env;
  if (e.EMAILJS_SERVICE_ID && e.EMAILJS_TEMPLATE_ID && e.EMAILJS_PUBLIC_KEY && e.EMAILJS_PRIVATE_KEY) return 'EmailJS';
  if (e.RESEND_API_KEY && e.MAIL_FROM) return 'Resend';
  return '';
}
async function sendMail(to, subject, text) {
  const e = process.env, which = mailProvider();
  if (!which) return { ok: false, error: 'Email is not set up yet.' };
  try {
    let r;
    if (which === 'EmailJS') {
      r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: e.EMAILJS_SERVICE_ID, template_id: e.EMAILJS_TEMPLATE_ID, user_id: e.EMAILJS_PUBLIC_KEY, accessToken: e.EMAILJS_PRIVATE_KEY, template_params: { to_email: to, subject, message: text } })
      });
    } else {
      r = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: 'Bearer ' + e.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: e.MAIL_FROM, to: [to], subject, text })
      });
    }
    if (!r.ok) return { ok: false, error: which + ' said: ' + String(await r.text()).slice(0, 200) };
    return { ok: true, via: which };
  } catch (err) { return { ok: false, error: which + ': ' + err.message }; }
}
const ownerEmail = (cfg) => cfg.notifyEmail || process.env.OWNER_EMAIL || '';
const fmtDate = (ms) => new Date(ms).toISOString().slice(0, 10);

/* ------------------------------------------------------------------ admin guard */
function admin(req, res, write) {
  const cfg = L.env();
  if (!cfg.ok) { L.send(res, 503, { code: 'setup', message: cfg.error }); return false; }
  if (!L.readSession(req, cfg)) { bad(res, 401, 'Not signed in', 'auth'); return false; }
  if (write && (req.method !== 'POST' || !L.hasAdminHeader(req))) { bad(res, 403, 'Forbidden'); return false; }
  return true;
}

/* ------------------------------------------------------------------ handler */
module.exports = async (req, res) => {
  const action = L.query(req, 'action');
  try {
    if (!R.conf()) {
      // Not connected yet: the public site keeps working with no limits and no premium.
      if (action === 'plans' || action === 'me') return L.send(res, 200, { enabled: false, available: false, enforce: false, user: null });
      if (action === 'use') { res.statusCode = 204; return res.end(); }
      return bad(res, 503, 'Accounts need the Upstash Redis database. Connect it in Vercel (Storage) and redeploy.', 'storage');
    }
    if (!secret()) return bad(res, 503, 'Server is missing its secret settings (GITHUB_TOKEN).', 'setup');
    const body = L.readBody(req);
    const member = (needHeader) => needHeader && (req.method !== 'POST' || req.headers['x-wt'] !== '1');

    /* ---------- public ---------- */
    if (action === 'plans') {
      const cfg = await getCfg();
      return L.send(res, 200, { enabled: true, available: available(cfg), enforce: enforcing(cfg), currency: cfg.currency, plans: cfg.plans, limits: cfg.limits, intro: cfg.intro, contact: cfg.contact });
    }

    if (action === 'me') {
      const cfg = await getCfg();
      const user = await currentUser(req);
      const out = { enabled: true, available: available(cfg), enforce: false, user: publicUser(user) };
      if (enforcing(cfg) && !isPremium(user)) {
        out.enforce = true; out.limits = cfg.limits;
        const slug = L.query(req, 'slug');
        if (validSlug(slug)) {
          const vid = sha(secret() + '|' + day() + '|' + ipOf(req) + '|' + (req.headers['user-agent'] || '')).slice(0, 24);
          out.used = Number(await one(['GET', 'wt:q:' + day() + ':' + vid + ':' + slug])) || 0;
        }
      }
      return L.send(res, 200, out);
    }

    if (action === 'use') {
      if (member(true)) { res.statusCode = 403; return res.end(); }
      const slug = String(body.slug || ''), n = Math.max(1, Math.min(500, parseInt(body.n, 10) || 1));
      if (!validSlug(slug)) { res.statusCode = 400; return res.end(); }
      const vid = sha(secret() + '|' + day() + '|' + ipOf(req) + '|' + (req.headers['user-agent'] || '')).slice(0, 24);
      const key = 'wt:q:' + day() + ':' + vid + ':' + slug;
      const r = await run([['INCRBY', key, n], ['EXPIRE', key, 172800]]);
      return L.send(res, 200, { used: Number(r[0]) || 0 });
    }

    if (action === 'signup' || action === 'login') {
      if (member(true)) return bad(res, 403, 'Forbidden');
      const email = normEmail(body.email), pw = String(body.password || '');
      const ipk = sha(secret() + '|ip|' + ipOf(req)).slice(0, 20);
      if (action === 'signup') {
        if (!validEmail(email)) return bad(res, 400, 'Please enter a valid email address.');
        if (pw.length < 8 || pw.length > 200) return bad(res, 400, 'Password must be at least 8 characters.');
        if (!(await rateLimit('wt:rl:su:' + ipk, 8, 3600))) return bad(res, 429, 'Too many sign-ups from this network. Try again later.');
        const user = { email, ph: await hashPw(pw), created: Date.now(), until: 0 };
        const made = await one(['SET', 'wt:user:' + email, JSON.stringify(user), 'NX']);
        if (made !== 'OK') return bad(res, 409, 'This email is already registered. Please sign in.');
        await one(['SADD', 'wt:users', email]);
        return L.send(res, 200, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(makeSession(user), 30 * 24 * 3600) });
      }
      if (!(await rateLimit('wt:rl:li:' + ipk, 15, 900))) return bad(res, 429, 'Too many attempts. Please wait 15 minutes.');
      const raw = validEmail(email) ? await one(['GET', 'wt:user:' + email]) : null;
      let user = null;
      try { user = raw ? JSON.parse(raw) : null; } catch (e) { user = null; }
      const okPw = await checkPw(pw, user ? user.ph : 's1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'); // same work either way
      if (!user || !okPw) return bad(res, 401, 'Wrong email or password.');
      return L.send(res, 200, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(makeSession(user), 30 * 24 * 3600) });
    }

    if (action === 'logout') {
      if (member(true)) return bad(res, 403, 'Forbidden');
      return L.send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
    }

    /* ---------- members ---------- */
    if (action === 'methods' || action === 'pay' || action === 'mypay') {
      const user = await currentUser(req);
      if (!user) return bad(res, 401, 'Please sign in first.', 'auth');
      const cfg = await getCfg();

      if (action === 'methods') return L.send(res, 200, { currency: cfg.currency, plans: cfg.plans, methods: cfg.methods });

      if (action === 'mypay') {
        const ids = (await one(['LRANGE', 'wt:upay:' + user.email, 0, 9])) || [];
        const recs = ids.length ? await one(['MGET'].concat(ids.map((i) => 'wt:pay:' + i))) : [];
        const list = recs.map((r) => { try { return JSON.parse(r); } catch (e) { return null; } }).filter(Boolean)
          .map((p) => ({ id: p.id, plan: p.planLabel, amount: p.amount, currency: p.currency, method: p.methodName, created: p.created, status: p.status, note: p.note || '' }));
        return L.send(res, 200, { list });
      }

      if (member(true)) return bad(res, 403, 'Forbidden');
      if (!available(cfg)) return bad(res, 400, 'Premium is not open yet.');
      const plan = cfg.plans[String(body.plan)];
      const method = cfg.methods.filter((m) => m.id === String(body.method))[0];
      if (!plan || !method) return bad(res, 400, 'Please choose a plan and a payment method.');
      const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(body.proof || ''));
      if (!m || m[1].length > 700000) return bad(res, 400, 'Please attach a screenshot (JPEG, under about 500 KB).');
      const buf = Buffer.from(m[1], 'base64');
      if (buf.length < 1000 || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) return bad(res, 400, 'The screenshot could not be read. Try another image.');
      if (!(await rateLimit('wt:rl:pay:' + sha(user.email).slice(0, 16), 6, 3600))) return bad(res, 429, 'Too many requests. Please try again later.');
      const prev = (await one(['LRANGE', 'wt:upay:' + user.email, 0, 9])) || [];
      const prevRecs = prev.length ? await one(['MGET'].concat(prev.map((i) => 'wt:pay:' + i))) : [];
      const pending = prevRecs.map((r) => { try { return JSON.parse(r); } catch (e) { return null; } }).filter((p) => p && p.status === 'pending').length;
      if (pending >= 3) return bad(res, 429, 'You already have 3 requests waiting for approval.');

      const id = crypto.randomBytes(8).toString('hex');
      const rec = { id, email: user.email, plan: String(body.plan), planLabel: plan.label, days: plan.days, amount: plan.price, currency: cfg.currency,
        method: method.id, methodName: method.name, ref: String(body.ref || '').trim().slice(0, 200), created: Date.now(), status: 'pending', note: '' };
      await run([['SET', 'wt:proof:' + id, m[1]], ['SET', 'wt:pay:' + id, JSON.stringify(rec)], ['LPUSH', 'wt:pay:all', id], ['LTRIM', 'wt:pay:all', 0, 499],
        ['LPUSH', 'wt:upay:' + user.email, id], ['LTRIM', 'wt:upay:' + user.email, 0, 19]]);
      const to = ownerEmail(cfg);
      if (to) await sendMail(to, 'New Premium payment request', user.email + ' sent a ' + plan.label + ' request (' + plan.price + ' ' + cfg.currency + ' via ' + method.name + '). Open /admin/ > Premium to review the screenshot.');
      return L.send(res, 200, { ok: true, id });
    }

    /* ---------- admin ---------- */
    if (action === 'a_cfg') {
      if (!admin(req, res, false)) return;
      return L.send(res, 200, { cfg: await getCfg(true), mail: mailProvider() });
    }
    if (action === 'a_savecfg') {
      if (!admin(req, res, true)) return;
      const cfg = cleanCfg(body.cfg);
      await one(['SET', 'wt:cfg', JSON.stringify(cfg)]);
      cfgCache = { t: Date.now(), v: cfg };
      return L.send(res, 200, { cfg });
    }
    if (action === 'a_pay') {
      if (!admin(req, res, false)) return;
      const ids = (await one(['LRANGE', 'wt:pay:all', 0, 99])) || [];
      const recs = ids.length ? await one(['MGET'].concat(ids.map((i) => 'wt:pay:' + i))) : [];
      return L.send(res, 200, { list: recs.map((r) => { try { return JSON.parse(r); } catch (e) { return null; } }).filter(Boolean) });
    }
    if (action === 'proof') {
      if (!admin(req, res, false)) return;
      const id = L.query(req, 'id');
      if (!/^[a-f0-9]{16}$/.test(id)) return bad(res, 400, 'Bad id');
      const b64 = await one(['GET', 'wt:proof:' + id]);
      if (!b64) return bad(res, 404, 'No screenshot (it is deleted after a decision).');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.end(Buffer.from(b64, 'base64'));
    }
    if (action === 'a_decide') {
      if (!admin(req, res, true)) return;
      const id = String(body.id || '');
      if (!/^[a-f0-9]{16}$/.test(id)) return bad(res, 400, 'Bad id');
      const raw = await one(['GET', 'wt:pay:' + id]);
      let rec = null;
      try { rec = raw ? JSON.parse(raw) : null; } catch (e) { rec = null; }
      if (!rec) return bad(res, 404, 'Request not found.');
      if (rec.status !== 'pending') return bad(res, 409, 'This request was already ' + rec.status + '.');
      const note = String(body.note || '').trim().slice(0, 300);
      let mail;
      if (body.decision === 'approve') {
        const uraw = await one(['GET', 'wt:user:' + rec.email]);
        let user = null;
        try { user = uraw ? JSON.parse(uraw) : null; } catch (e) { user = null; }
        if (!user) return bad(res, 404, 'This member no longer exists.');
        user.until = Math.max(Date.now(), Number(user.until) || 0) + rec.days * DAY;
        await saveUser(user);
        rec.status = 'approved'; rec.until = user.until;
        mail = await sendMail(rec.email, 'Your Premium is active', 'Thank you! Your ' + rec.planLabel + ' Premium is now active until ' + fmtDate(user.until) + ' (UTC). Sign in on the website to use it.');
      } else if (body.decision === 'reject') {
        rec.status = 'rejected';
        mail = await sendMail(rec.email, 'About your Premium payment', 'We could not approve your payment request.' + (note ? ' Reason: ' + note : '') + ' You are welcome to send a new request with a clearer screenshot.');
      } else return bad(res, 400, 'Choose approve or reject.');
      rec.note = note; rec.decided = Date.now();
      await run([['SET', 'wt:pay:' + id, JSON.stringify(rec)], ['DEL', 'wt:proof:' + id]]);
      return L.send(res, 200, { rec, mail });
    }
    if (action === 'a_users') {
      if (!admin(req, res, false)) return;
      const emails = ((await one(['SMEMBERS', 'wt:users'])) || []).slice(0, 1000);
      const recs = emails.length ? await one(['MGET'].concat(emails.map((e) => 'wt:user:' + e))) : [];
      const list = recs.map((r) => { try { return JSON.parse(r); } catch (e) { return null; } }).filter(Boolean)
        .map((u) => ({ email: u.email, created: u.created, until: Number(u.until) || 0 })).sort((a, b) => b.created - a.created);
      return L.send(res, 200, { list });
    }
    if (action === 'a_grant' || action === 'a_revoke' || action === 'a_resetpw') {
      if (!admin(req, res, true)) return;
      const email = normEmail(body.email);
      const raw = validEmail(email) ? await one(['GET', 'wt:user:' + email]) : null;
      let user = null;
      try { user = raw ? JSON.parse(raw) : null; } catch (e) { user = null; }
      if (!user) return bad(res, 404, 'Member not found.');
      let temp = '';
      if (action === 'a_grant') {
        const days = Math.max(1, Math.min(3650, parseInt(body.days, 10) || 0));
        if (!days) return bad(res, 400, 'Enter a number of days.');
        user.until = Math.max(Date.now(), Number(user.until) || 0) + days * DAY;
      } else if (action === 'a_revoke') user.until = 0;
      else { temp = crypto.randomBytes(9).toString('base64url').slice(0, 12); user.ph = await hashPw(temp); }
      await saveUser(user);
      return L.send(res, 200, { user: { email: user.email, until: Number(user.until) || 0 }, temp });
    }
    if (action === 'a_testmail') {
      if (!admin(req, res, true)) return;
      const cfg = await getCfg();
      const to = ownerEmail(cfg);
      if (!to) return bad(res, 400, 'Enter your email in "Send alerts to" and save first.');
      return L.send(res, 200, { mail: await sendMail(to, 'Test email', 'This is a test email from your website. Email is working.') });
    }

    return bad(res, 404, 'Unknown action');
  } catch (e) {
    console.error('acct error:', e && e.message);
    return bad(res, e && e.code === 'storage' ? 503 : 500, e && e.code === 'storage' ? 'Storage is not connected.' : 'Something went wrong. Please try again.', e && e.code);
  }
};
