/* Tiny Upstash / Vercel KV client over REST (plain fetch, no packages).
   Needs the two variables Vercel adds when you connect an Upstash Redis database to the project. */
function conf() {
  const e = process.env;
  const url = e.KV_REST_API_URL || e.UPSTASH_REDIS_REST_URL;
  const token = e.KV_REST_API_TOKEN || e.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: String(url).replace(/\/+$/, ''), token } : null;
}
/* Runs several commands in one request, e.g. [['INCR','a'],['GET','b']]. Returns the results in order. */
async function pipeline(cmds) {
  const c = conf();
  if (!c) throw Object.assign(new Error('Analytics storage is not connected yet.'), { code: 'storage' });
  const r = await fetch(c.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error('Storage answered with status ' + r.status + '.');
  const out = await r.json();
  return out.map((x) => { if (x && x.error) throw new Error(x.error); return x ? x.result : null; });
}
module.exports = { conf, pipeline };
