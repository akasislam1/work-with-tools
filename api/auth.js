/* /api/auth?action=login | logout | session */
const L = require('./_lib');

module.exports = async (req, res) => {
  const cfg = L.env();
  const action = L.query(req, 'action');
  if (!cfg.ok) return L.send(res, 503, { code: 'setup', message: cfg.error });

  if (action === 'session') {
    if (req.method !== 'GET') return L.send(res, 405, { message: 'Use GET' });
    const s = L.readSession(req, cfg);
    if (!s) return L.send(res, 401, { code: 'auth', message: 'Not signed in' });
    return L.send(res, 200, { repo: cfg.repo, branch: cfg.branch, user: s.u });
  }

  if (action === 'logout') {
    if (req.method !== 'POST' || !L.hasAdminHeader(req)) return L.send(res, 403, { message: 'Forbidden' });
    return L.send(res, 200, { ok: true }, { 'Set-Cookie': L.cookieHeader('', 0) });
  }

  if (action === 'login') {
    if (req.method !== 'POST' || !L.hasAdminHeader(req)) return L.send(res, 403, { message: 'Forbidden' });
    const body = L.readBody(req);
    const userOk = L.safeEqual(body.username || '', cfg.user);
    const passOk = L.safeEqual(body.password || '', cfg.pass);
    if (!(userOk && passOk)) {
      await L.sleep(1200); // slows down password guessing
      return L.send(res, 401, { code: 'login', message: 'Wrong username or password.' });
    }
    const seconds = body.remember ? 30 * 24 * 3600 : 8 * 3600;
    return L.send(res, 200, { repo: cfg.repo, branch: cfg.branch }, { 'Set-Cookie': L.cookieHeader(L.makeSession(cfg, seconds), seconds) });
  }

  return L.send(res, 404, { message: 'Unknown action' });
};
