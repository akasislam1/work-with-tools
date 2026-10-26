/* /api/gh?path=/repos/<owner>/<repo>/...  : a locked-down proxy to the GitHub API.
   Only signed-in admins can use it, only for the configured repo, and only for the few calls the admin panel needs. */
const L = require('./_lib');

function allowed(cfg, method, path) {
  if (!path || path.indexOf('..') > -1 || path.indexOf('//') > -1 || /%2e|%2f|%5c/i.test(path)) return false;
  const repo = cfg.repo.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    '^/repos/' + repo + '(?:$|/(contents/[\\w.~%/-]+|git/(?:ref|refs)/heads/[\\w.%/-]+|git/commits(?:/[0-9a-f]{40})?|git/blobs|git/trees(?:/[0-9a-f]{40})?))(?:\\?[\\w.~%&=+/-]*)?$', 'i');
  const m = re.exec(path);
  if (!m) return false;
  const sub = m[1] || '';
  if (sub === '' || sub.indexOf('contents/') === 0) return method === 'GET';
  if (sub.indexOf('git/ref/heads/') === 0) return method === 'GET';
  if (sub.indexOf('git/refs/heads/') === 0) return method === 'PATCH';
  if (sub.indexOf('git/commits/') === 0) return method === 'GET';
  if (sub === 'git/commits' || sub === 'git/blobs') return method === 'POST';
  if (sub.indexOf('git/trees/') === 0) return method === 'GET';
  if (sub === 'git/trees') return method === 'POST';
  return false;
}

module.exports = async (req, res) => {
  const cfg = L.env();
  if (!cfg.ok) return L.send(res, 503, { code: 'setup', message: cfg.error });
  if (!L.readSession(req, cfg)) return L.send(res, 401, { code: 'auth', message: 'Not signed in' });
  if (!L.hasAdminHeader(req)) return L.send(res, 403, { message: 'Forbidden' });

  const path = L.query(req, 'path');
  const method = req.method;
  if (!allowed(cfg, method, path)) return L.send(res, 403, { message: 'That GitHub request is not allowed.' });

  const raw = String(req.headers.accept || '').indexOf('vnd.github.raw') > -1;
  const headers = {
    Authorization: 'Bearer ' + cfg.token,
    Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'work-with-tools-admin'
  };
  let body;
  if (method !== 'GET') { headers['Content-Type'] = 'application/json'; body = JSON.stringify(L.readBody(req)); }

  let r;
  try { r = await fetch('https://api.github.com' + path, { method, headers, body }); }
  catch (e) { return L.send(res, 502, { message: 'Could not reach GitHub. Try again in a moment.' }); }

  const text = await r.text();
  if (r.status === 401) return L.send(res, 502, { message: 'GitHub rejected the token saved in Vercel (GITHUB_TOKEN). Create a new token and update it there.' });
  res.statusCode = r.status;
  res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(text);
};
