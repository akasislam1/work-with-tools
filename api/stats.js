/* GET /api/stats?days=90  (admin only). Returns one entry per day, newest first. */
const L = require('./_lib');
const R = require('./_redis');

const obj = (flat) => { const o = {}; for (let i = 0; Array.isArray(flat) && i + 1 < flat.length; i += 2) o[flat[i]] = Number(flat[i + 1]) || 0; return o; };

module.exports = async (req, res) => {
  const cfg = L.env();
  if (!cfg.ok) return L.send(res, 503, { code: 'setup', message: cfg.error });
  if (req.method !== 'GET') return L.send(res, 405, { message: 'Use GET' });
  if (!L.readSession(req, cfg)) return L.send(res, 401, { code: 'auth', message: 'Not signed in' });
  if (!R.conf()) return L.send(res, 503, { code: 'storage', message: 'Analytics storage is not connected yet.' });

  const n = Math.max(1, Math.min(120, parseInt(L.query(req, 'days'), 10) || 90));
  const days = [];
  for (let i = 0; i < n; i++) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  const cmds = [];
  days.forEach((d) => {
    const k = d.replace(/-/g, '');
    cmds.push(['GET', 'wt:pv:' + k], ['PFCOUNT', 'wt:vis:' + k], ['HGETALL', 'wt:tool:' + k],
      ['HGETALL', 'wt:cc:' + k], ['HGETALL', 'wt:dev:' + k], ['HGETALL', 'wt:ref:' + k]);
  });
  try {
    const r = await R.pipeline(cmds);
    const out = days.map((d, i) => ({
      d, pv: Number(r[i * 6]) || 0, vis: Number(r[i * 6 + 1]) || 0,
      tool: obj(r[i * 6 + 2]), cc: obj(r[i * 6 + 3]), dev: obj(r[i * 6 + 4]), ref: obj(r[i * 6 + 5])
    }));
    return L.send(res, 200, { days: out });
  } catch (e) {
    return L.send(res, 502, { code: 'storage', message: e.message });
  }
};
