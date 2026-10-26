/* Work With Tools - admin panel.
   Signs in with a username and password (checked by /api/auth on Vercel) and edits the site's GitHub repository
   through /api/gh, a locked-down proxy that holds the GitHub token on the server. Vercel redeploys after each commit. */
(function () {
  'use strict';

    var RESERVED = ['admin', 'assets', 'api'];
  var COLORS = ['blue', 'coral', 'green', 'amber', 'violet'];
  var AD_SLOTS = [
    ['homeTop', 'Home page: under the intro'],
    ['homeMiddle', 'Home page: between the categories'],
    ['toolTop', 'Tool pages: top'],
    ['toolBottom', 'Tool pages: bottom']
  ];
  var STATUS = { live: 'Live', paused: 'Paused', soon: 'Coming soon', hidden: 'Hidden (draft)' };
  var BRAND_SUFFIX = ' | Work With Tools';

  /* ---------- icon library (inner SVG markup, 24x24, stroke) ---------- */
  var ICONS = [
    ['droplet', '<path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z"/>'],
    ['shrink', '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>'],
    ['swap', '<path d="M17 3l4 4-4 4M21 7H8a4 4 0 0 0-4 4M7 21l-4-4 4-4M3 17h13a4 4 0 0 0 4-4"/>'],
    ['expand', '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'],
    ['crop', '<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>'],
    ['text', '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'],
    ['image', '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 9"/>'],
    ['file', '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'],
    ['file-image', '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><circle cx="10" cy="13" r="1.1"/><path d="M8 18l3-3 2 2 2-2"/>'],
    ['file-squeeze', '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M10 11l2 2 2-2M10 18l2-2 2 2"/>'],
    ['merge', '<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.2 2.9L4 22"/><path d="m20 22-5-5"/>'],
    ['split', '<path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.2-2.9L3 3M15 9l6-6"/>'],
    ['rotate', '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>'],
    ['hash', '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>'],
    ['trash', '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'],
    ['sliders', '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'],
    ['lock', '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'],
    ['pencil', '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'],
    ['download', '<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>'],
    ['upload', '<path d="M12 21V9M7 13l5-5 5 5M4 3h16"/>'],
    ['link', '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'],
    ['clock', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
    ['grid', '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'],
    ['star', '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>']
  ];
  var DEFAULT_ICON = ICONS[7][1];

  /* ---------- tiny DOM helper (no innerHTML for user data) ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function h(tag, attrs) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value' || k === 'checked' || k === 'selected' || k === 'disabled') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var kids = [].concat(arguments[i]);
      kids.forEach(function (c) {
        if (c === null || c === undefined || c === false) return;
        el.append(c.nodeType ? c : document.createTextNode(String(c)));
      });
    }
    return el;
  }

  /* ---------- icon sanitiser: only simple SVG shapes survive ---------- */
  var SVG_TAGS = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g'];
  var SVG_ATTRS = ['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points', 'transform', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'];
  function escAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function cleanIcon(markup) {
    if (!markup || !String(markup).trim()) return '';
    var doc;
    try { doc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + markup + '</svg>', 'image/svg+xml'); }
    catch (e) { return ''; }
    if (!doc.documentElement || doc.querySelector('parsererror')) return '';
    function walk(node) {
      var out = '';
      Array.prototype.forEach.call(node.childNodes, function (n) {
        if (n.nodeType !== 1) return;
        var tag = n.localName.toLowerCase();
        if (SVG_TAGS.indexOf(tag) === -1) return;
        var attrs = '';
        Array.prototype.forEach.call(n.attributes, function (a) {
          var name = a.name.toLowerCase();
          if (SVG_ATTRS.indexOf(name) === -1) return;
          if (/url\(|javascript:/i.test(a.value)) return;
          attrs += ' ' + name + '="' + escAttr(a.value) + '"';
        });
        out += tag === 'g' ? '<g' + attrs + '>' + walk(n) + '</g>' : '<' + tag + attrs + '/>';
      });
      return out;
    }
    return walk(doc.documentElement);
  }
  function iconEl(markup, cls) {
    var span = h('span', { class: cls || 'ico' });
    span.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (cleanIcon(markup) || DEFAULT_ICON) + '</svg>';
    return span;
  }

  /* ---------- state ---------- */
  var conn = null;                       // { repo, branch }  (no secrets in the browser)
  var S = { tools: [], cats: [], site: {}, ads: defaultAds(), base: '', pending: new Map(), delFolders: new Set() };
  var activeTab = 'tools';
  var toolQuery = '';
  var busy = false;

  /* ---------- helpers ---------- */
  function readFile(file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result)); };
      r.onerror = function () { rej(r.error || new Error('Could not read the file')); };
      r.readAsText(file);
    });
  }
  function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function unescHtml(s) { return String(s).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
  function snapshot() { return JSON.stringify({ tools: S.tools, cats: S.cats, site: S.site, ads: S.ads }); }
  function J(x) { return JSON.stringify(x, null, 2); }

  var noticeTimer = null;
  function notify(msg, type, link) {
    var n = $('notice');
    n.className = 'notice ' + (type || '');
    n.replaceChildren(msg);
    if (link) { n.append(' ', h('a', { href: link.href, target: '_blank', rel: 'noopener', text: link.text })); }
    n.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () { n.hidden = true; }, type === 'err' ? 9000 : 6000);
  }

  /* ---------- GitHub API (through our own /api/gh proxy) ---------- */
  function GhError(status, message, code) { this.status = status; this.message = message || ''; this.code = code || ''; }
  async function gh(path, opts) {
    opts = opts || {};
    var headers = { Accept: opts.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-WT-Admin': '1' };
    if (opts.body) headers['Content-Type'] = 'application/json';
    var res = await fetch('/api/gh?path=' + encodeURIComponent(path), {
      method: opts.method || 'GET', headers: headers, cache: 'no-store', credentials: 'same-origin',
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    if (res.status === 404 && opts.raw) return null;
    if (!res.ok) {
      var msg = '', code = '';
      try { var j = await res.json(); msg = j.message; code = j.code; } catch (e) { /* not JSON */ }
      if (res.status === 404 && !msg) code = 'noapi';
      if (code === 'auth') showLogin();
      throw new GhError(res.status, msg, code);
    }
    return opts.raw ? res.text() : res.json();
  }
  function explain(e) {
    if (!(e instanceof GhError)) return (e && e.message) || String(e);
    if (e.code === 'auth') return 'Your session ended. Please sign in again.';
    if (e.code === 'setup') return e.message;
    if (e.code === 'noapi') return 'The login service was not found. Make sure the "api" folder is in your repository and the site has been redeployed.';
    if (e.status === 403) return 'GitHub refused the request. The token in Vercel needs "Contents: Read and write" on this repo. ' + e.message;
    if (e.status === 404) return 'Not found. Check GITHUB_REPO in Vercel and that the token can access this repo.';
    if (e.status === 409 || e.status === 422) return 'The repository changed while you were editing. Click "Discard changes", reload, and try again. (' + e.message + ')';
    return e.message || ('GitHub error ' + e.status);
  }
  function encPath(p) { return p.split('/').map(encodeURIComponent).join('/'); }
  function readRaw(path) {
    return gh('/repos/' + conn.repo + '/contents/' + encPath(path) + '?ref=' + encodeURIComponent(conn.branch), { raw: true });
  }

  /* ---------- config file (assets/tools.js) ---------- */
  function normTool(t) {
    var status = t.status || (t.ready ? 'live' : 'soon');
    if (!STATUS[status]) status = 'soon';
    var out = { slug: String(t.slug), cat: String(t.cat || ''), name: String(t.name || t.slug), status: status, desc: String(t.desc || ''), kw: String(t.kw || ''), icon: cleanIcon(t.icon) || DEFAULT_ICON };
    if (t.pauseNote) out.pauseNote = String(t.pauseNote);
    return out;
  }
  /* ---------- ads (config lives in assets/tools.js as window.ADS) ---------- */
  function defaultAds() {
    var slots = {};
    AD_SLOTS.forEach(function (a) { slots[a[0]] = { on: false, type: 'code', code: '', img: '', link: '', alt: '' }; });
    return { enabled: false, adsenseClient: '', slots: slots };
  }
  function normAds(a) {
    var d = defaultAds();
    a = a || {};
    d.enabled = !!a.enabled;
    d.adsenseClient = String(a.adsenseClient || '').trim();
    AD_SLOTS.forEach(function (x) {
      var o = (a.slots && a.slots[x[0]]) || {}, n = d.slots[x[0]];
      n.on = !!o.on; n.type = o.type === 'banner' ? 'banner' : 'code';
      n.code = String(o.code || ''); n.img = String(o.img || '').trim(); n.link = String(o.link || '').trim(); n.alt = String(o.alt || '');
    });
    return d;
  }
  function safeUrl(u) { return /^(https:\/\/[^\s]+|\/[^\s]*)$/.test(u); }
  function adsProblem() {
    var a = normAds(S.ads);
    if (a.adsenseClient && !/^ca-pub-\d{10,20}$/.test(a.adsenseClient)) return 'The AdSense publisher ID must look like ca-pub-1234567890123456.';
    for (var i = 0; i < AD_SLOTS.length; i++) {
      var n = a.slots[AD_SLOTS[i][0]];
      if (!n.on) continue;
      if (n.type === 'code' && !n.code.trim()) return '"' + AD_SLOTS[i][1] + '" is switched on but has no ad code.';
      if (n.type === 'banner' && !(safeUrl(n.img) && safeUrl(n.link))) return '"' + AD_SLOTS[i][1] + '": the banner image and link must start with https:// (or /).';
    }
    return '';
  }
  /* Reads `window.NAME = <JSON>;` out of assets/tools.js WITHOUT running it (the admin page's security policy forbids eval). */
  function extractJson(src, name) {
    var m = new RegExp('window\\.' + name + '\\s*=\\s*').exec(src);
    if (!m) return undefined;
    var start = m.index + m[0].length, open = src.charAt(start);
    if (open !== '{' && open !== '[') throw new Error('assets/tools.js: "' + name + '" is not in the format the admin panel writes.');
    var depth = 0, inStr = false, esc = false;
    for (var j = start; j < src.length; j++) {
      var c = src.charAt(j);
      if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
      if (c === '"') inStr = true;
      else if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') {
        depth--;
        if (depth === 0) {
          try { return JSON.parse(src.slice(start, j + 1)); }
          catch (e) { throw new Error('assets/tools.js: could not read "' + name + '" (' + e.message + ').'); }
        }
      }
    }
    throw new Error('assets/tools.js: "' + name + '" is incomplete.');
  }
  function parseConfig(src) {
    var w = { SITE: extractJson(src, 'SITE'), TOOL_CATS: extractJson(src, 'TOOL_CATS'), TOOLS: extractJson(src, 'TOOLS'), ADS: extractJson(src, 'ADS') };
    var cats = Array.isArray(w.TOOL_CATS) ? w.TOOL_CATS : Object.keys(w.TOOL_CATS || {}).map(function (id) { return Object.assign({ id: id, color: 'blue' }, w.TOOL_CATS[id]); });
    return {
      tools: (w.TOOLS || []).map(normTool),
      cats: cats.map(function (c) { return { id: String(c.id), title: String(c.title || c.id), blurb: String(c.blurb || ''), color: COLORS.indexOf(c.color) > -1 ? c.color : 'blue' }; }),
      site: Object.assign({ siteUrl: '', heroTitle: '', heroText: '', footerText: '' }, w.SITE || {}),
      ads: normAds(w.ADS)
    };
  }
  function buildToolsJs() {
    return '/* Generated by the admin panel (/admin/). Edit tools there, not by hand. */\n' +
      'window.SITE = ' + J(S.site) + ';\n' +
      'window.TOOL_CATS = ' + J(S.cats) + ';\n' +
      'window.TOOLS = ' + J(S.tools.map(normTool)) + ';\n' +
      'window.ADS = ' + J(normAds(S.ads)) + ';\n';
  }
  function siteBase() {
    var u = String(S.site.siteUrl || '').trim().replace(/\/+$/, '');
    return /^https:\/\/[^\s/]+$/.test(u) ? u : '';
  }
  function buildSitemap() {
    var base = siteBase();
    if (!base) return null;
    var day = new Date().toISOString().slice(0, 10);
    var urls = [base + '/'].concat(S.tools.filter(function (t) { return t.status === 'live'; }).map(function (t) { return base + '/' + t.slug + '/'; }));
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(function (u) { return '  <url><loc>' + escHtml(u) + '</loc><lastmod>' + day + '</lastmod></url>'; }).join('\n') + '\n</urlset>\n';
  }
  function buildRobots() {
    var base = siteBase();
    return 'User-agent: *\nAllow: /\nDisallow: /admin/\n' + (base ? 'Sitemap: ' + base + '/sitemap.xml\n' : '');
  }

  /* ---------- tool page helpers (title, meta, header bar, footer scripts) ---------- */
  function setMeta(html, attr, name, content) {
    var tag = '<meta ' + attr + '="' + name + '" content="' + escHtml(content) + '">';
    var re = new RegExp('<meta\\s+' + attr + '="' + name + '"[^>]*>', 'i');
    if (re.test(html)) return html.replace(re, function () { return tag; });
    return html.replace(/<\/head>/i, function () { return tag + '\n</head>'; });
  }
  function applySeo(html, title, desc) {
    if (title) {
      var t = '<title>' + escHtml(title) + '</title>';
      html = /<title>[\s\S]*?<\/title>/i.test(html) ? html.replace(/<title>[\s\S]*?<\/title>/i, function () { return t; })
        : html.replace(/<\/head>/i, function () { return t + '\n</head>'; });
      html = setMeta(html, 'property', 'og:title', title.replace(/ \| Work With Tools$/, ''));
    }
    if (desc) {
      html = setMeta(html, 'name', 'description', desc);
      html = setMeta(html, 'property', 'og:description', desc);
    }
    return html;
  }
  function readSeo(html) {
    var t = /<title>([\s\S]*?)<\/title>/i.exec(html);
    var d = /<meta\s+name="description"\s+content="([^"]*)"/i.exec(html);
    return { title: t ? unescHtml(t[1].trim()) : '', desc: d ? unescHtml(d[1]) : '' };
  }
  var BAR = '<div class="wt-bar"><a class="wt-logo" href="/"><span class="wt-mark">W</span>Work With Tools</a><a class="wt-all" href="/">All tools</a></div>\n';
  function wrapToolHtml(html, title, desc) {
    if (html.indexOf('assets/site.css') > -1) return applySeo(html, title, desc); // already wrapped
    html = applySeo(html, title, desc);
    html = setMeta(html, 'name', 'theme-color', '#1f4bd8');
    html = html.replace(/<\/head>/i, function () { return '<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">\n<link rel="stylesheet" href="../assets/site.css">\n</head>'; });
    html = html.replace(/(<body[^>]*>)/i, function (m) { return m + '\n' + BAR; });
    var i = html.toLowerCase().lastIndexOf('</body>');
    var scripts = '<script src="../assets/tools.js"></script>\n<script src="../assets/site.js"></script>\n';
    return i > -1 ? html.slice(0, i) + scripts + html.slice(i) : html + scripts;
  }

  /* ---------- change tracking ---------- */
  function changeList() {
    var out = [];
    var b = JSON.parse(S.base || '{"tools":[],"cats":[],"site":{}}');
    var bm = {}; b.tools.forEach(function (t) { bm[t.slug] = t; });
    var cm = {}; S.tools.forEach(function (t) { cm[t.slug] = t; });
    S.tools.forEach(function (t) {
      var o = bm[t.slug];
      if (!o) { out.push('Add tool "' + t.name + '" (' + STATUS[t.status] + ')'); return; }
      if (o.status !== t.status) out.push('"' + t.name + '": ' + STATUS[o.status] + ' → ' + STATUS[t.status]);
      var other = ['name', 'cat', 'desc', 'kw', 'icon', 'pauseNote'].some(function (k) { return (o[k] || '') !== (t[k] || ''); });
      if (other) out.push('Edit "' + t.name + '"');
    });
    b.tools.forEach(function (t) { if (!cm[t.slug]) out.push('Remove tool "' + t.name + '"'); });
    var common = function (list) { return list.filter(function (t) { return bm[t.slug] && cm[t.slug]; }).map(function (t) { return t.slug; }).join(','); };
    if (common(b.tools) !== common(S.tools)) out.push('Change tool order');
    if (J(b.cats) !== J(S.cats)) out.push('Edit categories');
    if (J(b.site) !== J(S.site)) out.push('Edit site text');
    if (J(normAds(b.ads)) !== J(normAds(S.ads))) out.push('Edit ads');
    var bySlug = {};
    S.pending.forEach(function (_, p) { var s = p.split('/')[0]; bySlug[s] = (bySlug[s] || 0) + 1; });
    Object.keys(bySlug).forEach(function (s) { out.push('Upload ' + bySlug[s] + ' file(s) to /' + s + '/'); });
    S.delFolders.forEach(function (s) { out.push('Delete files in /' + s + '/'); });
    return out;
  }
  function touch() {
    var n = changeList().length;
    var btn = $('publishBtn');
    btn.disabled = n === 0 || busy;
    btn.textContent = n ? 'Publish ' + n + ' change' + (n > 1 ? 's' : '') : 'Publish changes';
    $('discardBtn').disabled = n === 0 || busy;
  }
  window.addEventListener('beforeunload', function (e) {
    if (conn && changeList().length) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------- modal ---------- */
  function openModal(title, body, buttons) {
    return new Promise(function (resolve) {
      var root = $('modalRoot');
      var overlay = h('div', { class: 'overlay' });
      var modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
      function close(v) { overlay.remove(); document.removeEventListener('keydown', onKey); resolve(v); }
      function onKey(e) { if (e.key === 'Escape') close(null); }
      var foot = h('div', { class: 'foot' }, buttons.map(function (b) {
        return h('button', { type: 'button', class: 'btn ' + (b.cls || ''), text: b.label, onclick: function () { b.onclick ? b.onclick(close) : close(b.value); } });
      }));
      modal.append(h('h2', { text: title }), body, foot);
      overlay.append(modal);
      root.append(overlay);
      document.addEventListener('keydown', onKey);
      var first = modal.querySelector('input,select,textarea,button');
      if (first) first.focus();
    });
  }
  function confirmBox(title, text, okLabel, danger) {
    return openModal(title, h('p', { text: text }), [
      { label: 'Cancel', value: false },
      { label: okLabel, value: true, cls: danger ? 'danger' : 'primary' }
    ]);
  }

  /* ---------- sign in / load ---------- */
  function showLogin() {
    statsCache = null; statsErr = null; statsLoading = false;
    conn = null;
    S = { tools: [], cats: [], site: {}, ads: defaultAds(), base: '', pending: new Map(), delFolders: new Set() };
    $('appView').hidden = true; $('connectView').hidden = false; $('passwordInput').value = '';
  }
  async function loadFromRepo() {
    var src = await readRaw('assets/tools.js');
    if (src === null) throw new Error('assets/tools.js was not found in the repository. Check GITHUB_REPO (and GITHUB_BRANCH) in Vercel.');
    var cfg = parseConfig(src);
    S.tools = cfg.tools; S.cats = cfg.cats; S.site = cfg.site; S.ads = cfg.ads;
    S.pending = new Map(); S.delFolders = new Set();
    S.base = snapshot();
  }
  async function enter(info) {
    conn = { repo: info.repo, branch: info.branch || '' };
    try {
      if (!conn.branch) conn.branch = (await gh('/repos/' + conn.repo)).default_branch || 'main';
      await loadFromRepo();
    } catch (e) { conn = null; throw e; }
    $('repoLabel').textContent = conn.repo + ' · ' + conn.branch;
    $('connectView').hidden = true;
    $('appView').hidden = false;
    try { localStorage.setItem('wt_no_track', '1'); } catch (e) { /* ignore */ }
    activeTab = 'tools';
    render();
  }
  async function authCall(action, method, body) {
    var res;
    try {
      res = await fetch('/api/auth?action=' + action, {
        method: method, credentials: 'same-origin', cache: 'no-store',
        headers: { 'X-WT-Admin': '1', 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) { throw new Error('Could not reach the server. Check your internet connection.'); }
    var j = null;
    try { j = await res.json(); } catch (e) { /* not JSON */ }
    return { status: res.status, ok: res.ok, data: j };
  }
  async function login(username, password, remember) {
    var r = await authCall('login', 'POST', { username: username, password: password, remember: !!remember });
    if (r.status === 404 && !r.data) throw new Error(explain(new GhError(404, '', 'noapi')));
    if (!r.ok) throw new Error((r.data && r.data.message) || 'Sign in failed (error ' + r.status + ').');
    await enter(r.data);
  }

  /* ---------- rendering ---------- */
  function render() {
    Array.prototype.forEach.call($('tabs').children, function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === activeTab)); });
    var p = $('panel');
    p.replaceChildren();
    if (activeTab === 'tools') renderTools(p);
    else if (activeTab === 'cats') renderCats(p);
    else if (activeTab === 'ads') renderAds(p);
    else if (activeTab === 'analytics') renderAnalytics(p);
    else renderSite(p);
    touch();
  }

  /* ----- tools tab ----- */
  function renderTools(p) {
    var count = function (s) { return S.tools.filter(function (t) { return t.status === s; }).length; };
    p.append(
      h('div', { class: 'stats', id: 'stats' }, Object.keys(STATUS).map(function (s) { return h('span', { class: 'chip', text: STATUS[s] + ': ' + count(s) }); })),
      h('div', { class: 'bar' },
        h('input', { type: 'search', id: 'toolSearch', placeholder: 'Search tools', value: toolQuery, 'aria-label': 'Search tools', oninput: function (e) { toolQuery = e.target.value; renderToolList(); } }),
        h('button', { type: 'button', class: 'btn primary', id: 'addToolBtn', text: '+ Add tool', onclick: function () { openToolEditor(null); } })
      ),
      h('div', { id: 'toolList' })
    );
    renderToolList();
  }
  function renderToolList() {
    var box = $('toolList');
    box.replaceChildren();
    var q = toolQuery.trim().toLowerCase();
    var match = function (t) { return !q || (t.name + ' ' + t.slug + ' ' + t.kw).toLowerCase().indexOf(q) > -1; };
    var known = {};
    var groups = S.cats.map(function (c) { known[c.id] = true; return { title: c.title, list: S.tools.filter(function (t) { return t.cat === c.id; }) }; });
    var lost = S.tools.filter(function (t) { return !known[t.cat]; });
    if (lost.length) groups.push({ title: 'No category', list: lost });
    var any = false;
    groups.forEach(function (g) {
      var list = g.list.filter(match);
      if (!list.length) return;
      any = true;
      box.append(h('section', { class: 'group' }, h('h2', null, g.title, h('small', { text: list.length + ' tool' + (list.length > 1 ? 's' : '') })), list.map(toolRow)));
    });
    if (!any) box.append(h('div', { class: 'empty', text: q ? 'No tool matches your search.' : 'No tools yet. Click "Add tool" to create the first one.' }));
  }
  function toolRow(t) {
    var sel = h('select', { 'aria-label': 'Status of ' + t.name, class: 's-' + t.status, onchange: function (e) {
      t.status = e.target.value;
      if (t.status === 'paused' && !t.pauseNote) { /* note optional */ }
      render();
    } }, Object.keys(STATUS).map(function (s) { return h('option', { value: s, text: STATUS[s], selected: s === t.status }); }));
    return h('div', { class: 'row', 'data-slug': t.slug },
      iconEl(t.icon),
      h('div', null, h('div', { class: 'name', text: t.name }), h('div', { class: 'sub', text: '/' + t.slug + '/ · ' + t.desc })),
      sel,
      h('div', { class: 'acts' },
        h('button', { type: 'button', class: 'btn small', title: 'Move up', 'aria-label': 'Move ' + t.name + ' up', text: '↑', onclick: function () { move(t, -1); } }),
        h('button', { type: 'button', class: 'btn small', title: 'Move down', 'aria-label': 'Move ' + t.name + ' down', text: '↓', onclick: function () { move(t, 1); } }),
        h('a', { class: 'btn small', href: '../' + t.slug + '/', target: '_blank', rel: 'noopener', text: 'Open' }),
        h('button', { type: 'button', class: 'btn small', text: 'Edit', onclick: function () { openToolEditor(t); } }),
        h('button', { type: 'button', class: 'btn small danger', text: 'Delete', onclick: function () { deleteTool(t); } })
      )
    );
  }
  function move(t, dir) {
    var same = S.tools.filter(function (x) { return x.cat === t.cat; });
    var j = same.indexOf(t) + dir;
    if (j < 0 || j >= same.length) return;
    var a = S.tools.indexOf(t), b = S.tools.indexOf(same[j]);
    S.tools[a] = same[j]; S.tools[b] = t;
    render();
  }
  async function deleteTool(t) {
    var chk = h('input', { type: 'checkbox', checked: true, id: 'delFilesChk' });
    var body = h('div', null,
      h('p', { text: 'Remove "' + t.name + '" from the site?' }),
      h('label', { class: 'check' }, chk, h('span', { text: 'Also delete its files (/' + t.slug + '/) from the repository' })),
      h('p', { class: 'hint', text: 'Nothing is lost for good: every change stays in your GitHub history.' }));
    var ok = await openModal('Delete tool', body, [
      { label: 'Cancel', value: false },
      { label: 'Delete', cls: 'danger', onclick: function (close) { close(true); } }
    ]);
    if (!ok) return;
    var wasInRepo = JSON.parse(S.base).tools.some(function (x) { return x.slug === t.slug; });
    S.tools = S.tools.filter(function (x) { return x !== t; });
    Array.from(S.pending.keys()).forEach(function (k) { if (k.indexOf(t.slug + '/') === 0) S.pending.delete(k); });
    if (chk.checked && wasInRepo) S.delFolders.add(t.slug);
    render();
  }

  /* ----- tool editor ----- */
  async function openToolEditor(tool) {
    var isNew = !tool;
    var d = tool ? Object.assign({}, tool) : { slug: '', cat: (S.cats[0] || {}).id || '', name: '', status: 'soon', desc: '', kw: '', icon: DEFAULT_ICON, pauseNote: '' };
    var slugTouched = false;
    var seo = { loaded: false, title: '', desc: '' };

    var f = {};
    function field(label, el, hint) { return h('label', { class: 'field' }, h('span', { text: label }), el, hint ? h('p', { class: 'hint', text: hint }) : null); }
    f.name = h('input', { type: 'text', id: 'fName', value: d.name, maxlength: '60', oninput: function () { if (isNew && !slugTouched) f.slug.value = slugify(f.name.value); } });
    f.slug = h('input', { type: 'text', id: 'fSlug', value: d.slug, maxlength: '50', disabled: !isNew, spellcheck: 'false', oninput: function () { slugTouched = true; } });
    f.cat = h('select', { id: 'fCat' }, S.cats.map(function (c) { return h('option', { value: c.id, text: c.title, selected: c.id === d.cat }); }));
    f.status = h('select', { id: 'fStatus' }, Object.keys(STATUS).map(function (s) { return h('option', { value: s, text: STATUS[s], selected: s === d.status }); }));
    f.pause = h('input', { type: 'text', id: 'fPause', value: d.pauseNote || '', maxlength: '140', placeholder: 'Shown to visitors while the tool is paused' });
    f.desc = h('textarea', { id: 'fDesc', rows: '2', maxlength: '140' }); f.desc.value = d.desc;
    f.kw = h('input', { type: 'text', id: 'fKw', value: d.kw, placeholder: 'words people might search for' });

    var iconGrid = h('div', { class: 'icons', role: 'group', 'aria-label': 'Icon' });
    var custom = h('textarea', { id: 'fIconCustom', rows: '2', placeholder: 'Or paste SVG shapes, e.g. <path d="M3 12h18"/>', spellcheck: 'false' });
    var preview = h('div', { class: 'ico-preview' });
    function paintIcons() {
      iconGrid.replaceChildren.apply(iconGrid, ICONS.map(function (ic) {
        var b = h('button', { type: 'button', title: ic[0], 'aria-label': ic[0], 'aria-pressed': String(ic[1] === d.icon), onclick: function () { d.icon = ic[1]; custom.value = ''; paintIcons(); } });
        b.append(iconEl(ic[1], 'x').firstChild);
        return b;
      }));
      preview.replaceChildren(iconEl(d.icon), h('span', { class: 'hint', text: 'Preview' }));
    }
    custom.addEventListener('input', function () { var c = cleanIcon(custom.value); if (c) { d.icon = c; paintIcons(); } });
    paintIcons();

    f.seoTitle = h('input', { type: 'text', id: 'fSeoTitle', maxlength: '70', placeholder: 'Page title for Google (defaults to "Name | Work With Tools")' });
    f.seoDesc = h('textarea', { id: 'fSeoDesc', rows: '2', maxlength: '200', placeholder: 'Short description for Google (defaults to the card description)' });
    f.html = h('input', { type: 'file', id: 'fHtml', accept: '.html,.htm,text/html' });
    f.js = h('input', { type: 'file', id: 'fJs', accept: '.js,text/javascript' });
    f.wrap = h('input', { type: 'checkbox', id: 'fWrap', checked: true });

    var body = h('div', null,
      h('div', { class: 'two' }, field('Name', f.name), field('URL name (slug)', f.slug, isNew ? 'Becomes /your-slug/ . Letters, numbers and dashes only.' : 'The URL cannot be changed. Delete and re-add to use another.')),
      h('div', { class: 'two' }, field('Category', f.cat), field('Status', f.status)),
      field('Pause message', f.pause, 'Only used when the status is Paused.'),
      field('Card description', f.desc),
      field('Search keywords', f.kw),
      h('div', { class: 'field' }, h('span', { text: 'Icon' }), iconGrid, custom, preview),
      h('div', { class: 'section-title', text: 'Search engine text' }),
      field('Page title', f.seoTitle), field('Meta description', f.seoDesc),
      h('div', { class: 'section-title', text: isNew ? 'Tool files' : 'Replace tool files (optional)' }),
      field('Tool page (the HTML file)', f.html, isNew ? 'Saved as /' + (d.slug || 'slug') + '/index.html. Any file name works.' : 'Leave empty to keep the current page.'),
      field('Tool script (optional)', f.js, 'Saved as script.js next to the page.'),
      h('label', { class: 'check' }, f.wrap, h('span', { text: 'Add the site header and footer automatically' }))
    );

    if (!isNew) {
      var cur = S.pending.get(d.slug + '/index.html');
      Promise.resolve(cur !== undefined ? cur : readRaw(d.slug + '/index.html').catch(function () { return null; })).then(function (html) {
        if (html) { var s = readSeo(html); seo = { loaded: true, title: s.title, desc: s.desc }; f.seoTitle.value = s.title; f.seoDesc.value = s.desc; }
      });
    }

    var res = await openModal(isNew ? 'Add tool' : 'Edit tool', body, [
      { label: 'Cancel', value: false },
      { label: isNew ? 'Add tool' : 'Save changes', cls: 'primary', onclick: async function (close) {
        try { await saveTool(); close(true); } catch (e) { notify(e.message || String(e), 'err'); }
      } }
    ]);
    return res;

    async function saveTool() {
      var name = f.name.value.trim(), slug = f.slug.value.trim();
      if (!name) throw new Error('Give the tool a name.');
      if (isNew) {
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error('The URL name can only use lowercase letters, numbers and single dashes.');
        if (RESERVED.indexOf(slug) > -1) throw new Error('"' + slug + '" is reserved. Choose another URL name.');
        if (S.tools.some(function (t) { return t.slug === slug; })) throw new Error('A tool with the URL name "' + slug + '" already exists.');
      }
      var status = f.status.value;
      var htmlFile = f.html.files && f.html.files[0], jsFile = f.js.files && f.js.files[0];
      if (isNew && !htmlFile && (status === 'live' || status === 'paused')) throw new Error('Upload the tool\'s HTML file, or set the status to "Coming soon" for now.');

      var title = f.seoTitle.value.trim(), desc = f.seoDesc.value.trim();
      var files = [];
      if (htmlFile) {
        var html = await readFile(htmlFile);
        var t2 = title || name + BRAND_SUFFIX, d2 = desc || f.desc.value.trim();
        files.push([slug + '/index.html', f.wrap.checked ? wrapToolHtml(html, t2, d2) : (title || desc ? applySeo(html, title, desc) : html)]);
      } else if (!isNew && seo.loaded && (title !== seo.title || desc !== seo.desc)) {
        var current = S.pending.get(slug + '/index.html');
        if (current === undefined) current = await readRaw(slug + '/index.html');
        if (current) files.push([slug + '/index.html', applySeo(current, title !== seo.title ? title : '', desc !== seo.desc ? desc : '')]);
      }
      if (jsFile) files.push([slug + '/script.js', await readFile(jsFile)]);

      var next = normTool({ slug: slug, cat: f.cat.value, name: name, status: status, desc: f.desc.value.trim(), kw: f.kw.value.trim(), icon: d.icon, pauseNote: f.pause.value.trim() });
      if (isNew) S.tools.push(next);
      else { var i = S.tools.indexOf(tool); S.tools[i] = next; }
      files.forEach(function (x) { S.pending.set(x[0], x[1]); });
      S.delFolders.delete(slug);
      render();
    }
  }

  /* ----- categories tab ----- */
  function renderCats(p) {
    p.append(h('div', { class: 'bar' }, h('button', { type: 'button', class: 'btn primary', id: 'addCatBtn', text: '+ Add category', onclick: addCat })));
    if (!S.cats.length) p.append(h('div', { class: 'empty', text: 'No categories yet.' }));
    S.cats.forEach(function (c, i) {
      var used = S.tools.filter(function (t) { return t.cat === c.id; }).length;
      p.append(h('div', { class: 'crow', 'data-id': c.id },
        h('label', { class: 'field' }, h('span', { text: 'Title' }), h('input', { type: 'text', value: c.title, maxlength: '40', oninput: function (e) { c.title = e.target.value; touch(); } })),
        h('label', { class: 'field' }, h('span', { text: 'Short description' }), h('input', { type: 'text', value: c.blurb, maxlength: '120', oninput: function (e) { c.blurb = e.target.value; touch(); } })),
        h('label', { class: 'field' }, h('span', { text: 'Color' }), h('select', { onchange: function (e) { c.color = e.target.value; touch(); } }, COLORS.map(function (col) { return h('option', { value: col, text: col, selected: col === c.color }); }))),
        h('div', { class: 'acts' },
          h('button', { type: 'button', class: 'btn small', text: '↑', 'aria-label': 'Move category up', onclick: function () { swapCat(i, -1); } }),
          h('button', { type: 'button', class: 'btn small', text: '↓', 'aria-label': 'Move category down', onclick: function () { swapCat(i, 1); } }),
          h('button', { type: 'button', class: 'btn small danger', text: 'Delete', disabled: used > 0, title: used ? 'Move or delete its ' + used + ' tool(s) first' : 'Delete category', onclick: function () { S.cats.splice(i, 1); render(); } })
        )));
    });
  }
  function swapCat(i, dir) { var j = i + dir; if (j < 0 || j >= S.cats.length) return; var t = S.cats[i]; S.cats[i] = S.cats[j]; S.cats[j] = t; render(); }
  async function addCat() {
    var title = h('input', { type: 'text', id: 'newCatTitle', maxlength: '40' });
    var body = h('label', { class: 'field' }, h('span', { text: 'Category title' }), title);
    var ok = await openModal('Add category', body, [
      { label: 'Cancel', value: false },
      { label: 'Add', cls: 'primary', onclick: function (close) {
        var v = title.value.trim(), id = slugify(v);
        if (!id) { notify('Type a title first.', 'err'); return; }
        if (S.cats.some(function (c) { return c.id === id; })) { notify('That category already exists.', 'err'); return; }
        S.cats.push({ id: id, title: v, blurb: '', color: COLORS[S.cats.length % COLORS.length] });
        close(true);
      } }
    ]);
    if (ok) render();
  }

  /* ----- analytics tab ----- */
  var statsCache = null, statsErr = null, statsLoading = false, statsRange = 30;
  var RANGES = [['Today', 1], ['7 days', 7], ['30 days', 30], ['90 days', 90]];

  function ensureStats(force) {
    if (statsLoading) return;
    if (!force && (statsCache || statsErr)) return;
    statsLoading = true; statsErr = null;
    fetchStats();
  }
  async function fetchStats() {
    try {
      var res = await fetch('/api/stats?days=90', { credentials: 'same-origin', cache: 'no-store', headers: { 'X-WT-Admin': '1' } });
      var data = {};
      try { data = await res.json(); } catch (e) { /* not JSON */ }
      if (!res.ok) throw Object.assign(new Error(data.message || ('Could not load the statistics (error ' + res.status + ').')), { code: data.code || '' });
      statsCache = data.days || [];
    } catch (e) {
      statsErr = { code: e.code || '', message: e.message || 'Could not load the statistics.' };
    }
    statsLoading = false;
    if (activeTab === 'analytics') render();
  }

  function addTo(target, src) { Object.keys(src || {}).forEach(function (k) { target[k] = (target[k] || 0) + src[k]; }); }
  function aggregate(days, n) {
    var t = { pv: 0, vis: 0, use: 0, dl: 0, tools: {}, cc: {}, dev: {}, ref: {} };
    days.slice(0, n).forEach(function (d) {
      t.pv += d.pv; t.vis += d.vis;
      Object.keys(d.tool).forEach(function (k) {
        var i = k.lastIndexOf('|'), slug = k.slice(0, i), kind = k.slice(i + 1);
        if (kind !== 'pv' && kind !== 'use' && kind !== 'dl') return;
        var row = t.tools[slug] || (t.tools[slug] = { pv: 0, use: 0, dl: 0 });
        row[kind] += d.tool[k];
        if (kind === 'use') t.use += d.tool[k];
        if (kind === 'dl') t.dl += d.tool[k];
      });
      addTo(t.cc, d.cc); addTo(t.dev, d.dev); addTo(t.ref, d.ref);
    });
    return t;
  }
  function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }
  function toolLabel(slug) {
    if (slug === 'home') return 'Home page';
    var t = S.tools.filter(function (x) { return x.slug === slug; })[0];
    return t ? t.name : slug;
  }
  function countryName(code) {
    if (code === '??') return 'Unknown';
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch (e) { return code; }
  }
  function topList(map, limit) {
    return Object.keys(map).map(function (k) { return [k, map[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, limit);
  }
  function meter(value, max) {
    var fill = h('div', { class: 'meter-fill' });
    fill.style.width = (max ? Math.max(2, Math.round(value / max * 100)) : 0) + '%'; // set by script, allowed by the page's security policy
    return h('div', { class: 'meter' }, fill);
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) el.append(arguments[i]);
    return el;
  }
  function chart(days) { // days: oldest -> newest
    var max = Math.max.apply(null, days.map(function (d) { return d.vis; }).concat([1]));
    var step = 10, H = 100;
    var svg = svgEl('svg', { viewBox: '0 0 ' + days.length * step + ' ' + H, preserveAspectRatio: 'none', class: 'chart', role: 'img', 'aria-label': 'Visitors per day' });
    days.forEach(function (d, i) {
      var bh = d.vis ? Math.max(2, Math.round(d.vis / max * (H - 4))) : 0;
      var r = svgEl('rect', { x: i * step + 1, y: H - bh, width: step - 2, height: bh, class: 'barv' });
      r.append(svgEl('title', {})); r.firstChild.textContent = d.d + ': ' + fmt(d.vis) + ' visitors, ' + fmt(d.pv) + ' page views';
      svg.append(r);
    });
    return h('div', null, svg,
      h('div', { class: 'axis' }, h('span', { text: days[0].d }), h('span', { text: 'Most visitors in a day: ' + fmt(max === 1 && !days.some(function (d) { return d.vis; }) ? 0 : max) }), h('span', { text: days[days.length - 1].d })));
  }

  function renderAnalytics(p) {
    ensureStats(false);
    var head = h('div', { class: 'bar' }, h('h2', { class: 'grow', text: 'Analytics' }),
      h('button', { type: 'button', class: 'btn small', text: 'Refresh', disabled: statsLoading, onclick: function () { ensureStats(true); render(); } }));
    var root = h('div', { class: 'dash' }, head);
    p.append(root);

    if (statsLoading && !statsCache) { root.append(h('p', { class: 'muted', text: 'Loading statistics…' })); return; }
    if (statsErr) {
      if (statsErr.code === 'storage') {
        root.append(h('div', { class: 'card' },
          h('h3', { text: 'One-time setup: connect a small database' }),
          h('p', { class: 'muted', text: 'Visit counts need somewhere to be stored. This takes about two minutes and is free to start with.' }),
          h('ol', { class: 'steps' },
            h('li', { text: 'In Vercel, open your project and go to the Storage tab (or Marketplace).' }),
            h('li', { text: 'Create an Upstash Redis database and connect it to this project. Vercel adds the access variables for you.' }),
            h('li', { text: 'Go to Deployments and Redeploy the latest one, then come back and press Refresh.' })),
          h('p', { class: 'hint', text: 'Until then the website works normally; it just does not record visits.' })));
      } else {
        root.append(h('div', { class: 'card' }, h('p', { class: 'err', text: statsErr.message })));
      }
      return;
    }
    if (!statsCache) return;

    var seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Time range' }, RANGES.map(function (r) {
      return h('button', { type: 'button', class: 'btn small' + (statsRange === r[1] ? ' on' : ''), 'aria-pressed': String(statsRange === r[1]), text: r[0],
        onclick: function () { statsRange = r[1]; render(); } });
    }));
    var A = aggregate(statsCache, statsRange);
    var perDay = statsCache.slice(0, statsRange).slice().reverse();

    root.append(seg,
      h('div', { class: 'kpis' },
        [['Visitors', A.vis], ['Page views', A.pv], ['Files added to tools', A.use], ['Downloads', A.dl]].map(function (k) {
          return h('div', { class: 'kpi' }, h('div', { class: 'kv', text: fmt(k[1]) }), h('div', { class: 'kl', text: k[0] }));
        })),
      h('p', { class: 'hint', text: 'Visitors are counted per day: a person who comes on 3 different days counts 3 times. Days follow UTC. "Files added" means someone put a file into a tool; downloads are counted when a tool starts a file download, so very rarely the number may be a little low.' }));

    if (!A.pv) {
      root.append(h('div', { class: 'card' }, h('p', { text: 'No visits recorded in this period yet.' }),
        h('p', { class: 'hint', text: 'Your own visits from this browser are not counted. To test, open the website in a private window or on another device.' })));
    } else {
      root.append(h('div', { class: 'card' }, h('h3', { text: 'Visitors per day' }), chart(perDay)));

      var rows = Object.keys(A.tools).map(function (k) { return [k, A.tools[k]]; }).sort(function (a, b) { return b[1].pv - a[1].pv; });
      var maxPv = rows.length ? rows[0][1].pv : 0;
      root.append(h('div', { class: 'card' }, h('h3', { text: 'Which tools are used most' }),
        h('div', { class: 'tablewrap' }, h('table', { class: 'tbl' },
          h('thead', null, h('tr', null, ['Tool', 'Views', 'Files added', 'Downloads'].map(function (c, i) { return h('th', { class: i ? 'num' : '', text: c }); }))),
          h('tbody', null, rows.map(function (r) {
            return h('tr', null, h('td', null, h('div', { text: toolLabel(r[0]) }), meter(r[1].pv, maxPv)),
              h('td', { class: 'num', text: fmt(r[1].pv) }), h('td', { class: 'num', text: fmt(r[1].use) }), h('td', { class: 'num', text: fmt(r[1].dl) }));
          }))))));

      function listCard(title, map, labeler) {
        var top = topList(map, 8), max = top.length ? top[0][1] : 0;
        return h('div', { class: 'card' }, h('h3', { text: title }),
          top.length ? top.map(function (r) {
            return h('div', { class: 'lrow' }, h('span', { text: labeler(r[0]) }), h('span', { class: 'num', text: fmt(r[1]) }), meter(r[1], max));
          }) : h('p', { class: 'muted', text: 'No data yet.' }));
      }
      root.append(h('div', { class: 'cols' },
        listCard('Countries', A.cc, countryName),
        listCard('Where visitors come from', A.ref, function (k) { return k === 'direct' ? 'Direct / unknown' : k; }),
        listCard('Devices', A.dev, function (k) { return k === 'mobile' ? 'Mobile' : 'Desktop'; })));
    }

    // by month (from the last 90 days of data)
    var months = {}, order = [];
    statsCache.forEach(function (d) {
      var m = d.d.slice(0, 7);
      if (!months[m]) { months[m] = { vis: 0, pv: 0, use: 0, first: d.d }; order.push(m); }
      months[m].vis += d.vis; months[m].pv += d.pv; months[m].first = d.d;
      Object.keys(d.tool).forEach(function (k) { if (k.slice(-4) === '|use') months[m].use += d.tool[k]; });
    });
    var oldest = statsCache.length ? statsCache[statsCache.length - 1].d : '';
    root.append(h('div', { class: 'card' }, h('h3', { text: 'By month' }),
      h('div', { class: 'tablewrap' }, h('table', { class: 'tbl' },
        h('thead', null, h('tr', null, ['Month', 'Visitors', 'Page views', 'Files added'].map(function (c, i) { return h('th', { class: i ? 'num' : '', text: c }); }))),
        h('tbody', null, order.map(function (m) {
          var partial = m === oldest.slice(0, 7) && oldest.slice(8) !== '01';
          return h('tr', null, h('td', { text: m + (partial ? ' (from the ' + Number(oldest.slice(8)) + 'th)' : '') }),
            h('td', { class: 'num', text: fmt(months[m].vis) }), h('td', { class: 'num', text: fmt(months[m].pv) }), h('td', { class: 'num', text: fmt(months[m].use) }));
        })))),
      h('p', { class: 'hint', text: 'The panel shows the last 90 days. Older numbers stay stored.' })));

    var own = true;
    try { own = localStorage.getItem('wt_no_track') === '1'; } catch (e) { /* ignore */ }
    root.append(h('div', { class: 'card' },
      h('label', { class: 'check' },
        h('input', { type: 'checkbox', checked: own, onchange: function (e) { try { if (e.target.checked) localStorage.setItem('wt_no_track', '1'); else localStorage.removeItem('wt_no_track'); } catch (x) { /* ignore */ } } }),
        h('span', { text: 'Do not count my own visits from this browser' })),
      h('p', { class: 'hint', text: 'No cookies are used and no IP addresses are stored. Browsers that send "Do Not Track" are not counted.' })));
  }

  /* ----- ads tab ----- */
  function renderAds(p) {
    var A = S.ads;
    function text(label, obj, key, attrs, hint) {
      var el = h(attrs.rows ? 'textarea' : 'input', Object.assign({ type: 'text' }, attrs));
      el.value = obj[key] || '';
      el.addEventListener('input', function () { obj[key] = el.value; touch(); });
      return h('label', { class: 'field' }, h('span', { text: label }), el, hint ? h('p', { class: 'hint', text: hint }) : null);
    }
    function check(label, obj, key, again) {
      return h('label', { class: 'check' },
        h('input', { type: 'checkbox', checked: !!obj[key], onchange: function (e) { obj[key] = e.target.checked; touch(); if (again) render(); } }),
        h('span', { text: label }));
    }
    p.append(h('div', { class: 'card panel' },
      h('h2', { text: 'Ads' }),
      h('p', { class: 'hint', text: 'Ads are off until you switch them on here and press Publish. Visitors see a small "Advertisement" label above every ad.' }),
      check('Show ads on the website', A, 'enabled'),
      text('Google AdSense publisher ID (optional)', A, 'adsenseClient', { id: 'adClient', placeholder: 'ca-pub-1234567890123456', maxlength: '40' },
        'Only needed for AdSense "Auto ads". For placements below, paste the ad unit code from your ad network instead.')));
    AD_SLOTS.forEach(function (x) {
      var n = A.slots[x[0]];
      var kind = h('select', { 'aria-label': 'Ad type for ' + x[1], onchange: function (e) { n.type = e.target.value; touch(); render(); } },
        h('option', { value: 'code', selected: n.type === 'code', text: 'Ad code (AdSense or other network)' }),
        h('option', { value: 'banner', selected: n.type === 'banner', text: 'Banner image with a link' }));
      p.append(h('div', { class: 'card panel slot' },
        h('h3', { text: x[1] }),
        check('Show this ad', n, 'on'),
        h('label', { class: 'field' }, h('span', { text: 'Type' }), kind),
        n.type === 'code'
          ? text('Ad code', n, 'code', { rows: '5', spellcheck: 'false', placeholder: '<script async src="..."></script> ...' }, 'Paste the full snippet your ad network gives you.')
          : h('div', null,
              text('Banner image address', n, 'img', { placeholder: 'https://.../banner.png', maxlength: '300' }),
              text('Link when clicked', n, 'link', { placeholder: 'https://...', maxlength: '300' }),
              text('Image description', n, 'alt', { maxlength: '120' }))));
    });
  }

  /* ----- site text tab ----- */
  function renderSite(p) {
    function bind(key, label, el, hint) {
      el.value = S.site[key] || '';
      el.addEventListener('input', function () { S.site[key] = el.value; touch(); });
      return h('label', { class: 'field' }, h('span', { text: label }), el, hint ? h('p', { class: 'hint', text: hint }) : null);
    }
    p.append(h('div', { class: 'card panel' },
      bind('heroTitle', 'Home page headline', h('input', { type: 'text', id: 'sHero', maxlength: '90' })),
      bind('heroText', 'Home page sub-text', h('textarea', { id: 'sHeroText', rows: '3', maxlength: '240' })),
      bind('footerText', 'Footer text', h('textarea', { id: 'sFooter', rows: '2', maxlength: '200' })),
      bind('siteUrl', 'Website address', h('input', { type: 'url', id: 'sUrl', placeholder: 'https://your-site.vercel.app' }),
        'Used to build sitemap.xml for Google. Leave empty to skip it. Use your final address, with https and without a trailing path.')
    ));
  }

  /* ---------- publish ---------- */
  async function doPublish(message) {
    var files = new Map(S.pending);
    files.set('assets/tools.js', buildToolsJs());
    files.set('robots.txt', buildRobots());
    var sm = buildSitemap();
    if (sm) files.set('sitemap.xml', sm);

    var refPath = '/repos/' + conn.repo + '/git/ref/heads/' + encodeURIComponent(conn.branch).replace(/%2F/g, '/');
    var ref = await gh(refPath);
    var parent = ref.object.sha;
    var parentCommit = await gh('/repos/' + conn.repo + '/git/commits/' + parent);
    var baseTree = parentCommit.tree.sha;

    var tree = [];
    var entries = Array.from(files.entries());
    for (var i = 0; i < entries.length; i++) {
      var blob = await gh('/repos/' + conn.repo + '/git/blobs', { method: 'POST', body: { content: entries[i][1], encoding: 'utf-8' } });
      tree.push({ path: entries[i][0], mode: '100644', type: 'blob', sha: blob.sha });
    }
    if (S.delFolders.size) {
      var full = await gh('/repos/' + conn.repo + '/git/trees/' + baseTree + '?recursive=1');
      var folders = Array.from(S.delFolders);
      full.tree.forEach(function (e) {
        if (e.type === 'blob' && !files.has(e.path) && folders.some(function (s) { return e.path.indexOf(s + '/') === 0; })) {
          tree.push({ path: e.path, mode: '100644', type: 'blob', sha: null });
        }
      });
    }
    var newTree = await gh('/repos/' + conn.repo + '/git/trees', { method: 'POST', body: { base_tree: baseTree, tree: tree } });
    var commit = await gh('/repos/' + conn.repo + '/git/commits', { method: 'POST', body: { message: message, tree: newTree.sha, parents: [parent] } });
    await gh('/repos/' + conn.repo + '/git/refs/heads/' + encodeURIComponent(conn.branch).replace(/%2F/g, '/'), { method: 'PATCH', body: { sha: commit.sha } });
    return commit;
  }
  async function publishFlow() {
    var changes = changeList();
    if (!changes.length || busy) return;
    var base = String(S.site.siteUrl || '').trim();
    if (base && !siteBase()) { notify('The website address must look like https://your-site.vercel.app', 'err'); activeTab = 'site'; render(); return; }
    var ap = adsProblem();
    if (ap) { notify(ap, 'err'); activeTab = 'ads'; render(); return; }
    var msg = h('input', { type: 'text', id: 'commitMsg', value: 'Update tools via admin panel', maxlength: '120' });
    var body = h('div', null,
      h('p', { text: 'These changes will go live in about a minute:' }),
      h('ul', { class: 'changes' }, changes.map(function (c) { return h('li', { text: c }); })),
      h('label', { class: 'field' }, h('span', { text: 'Note (saved in GitHub history)' }), msg));
    var ok = await openModal('Publish changes', body, [
      { label: 'Cancel', value: false },
      { label: 'Publish now', cls: 'primary', onclick: function (close) { close(true); } }
    ]);
    if (!ok) return;
    busy = true; touch();
    $('publishBtn').textContent = 'Publishing…';
    try {
      var commit = await doPublish(msg.value.trim() || 'Update tools via admin panel');
      await loadFromRepo();
      render();
      notify('Published. Vercel is updating the live site (usually under a minute).', 'ok', commit.html_url ? { href: commit.html_url, text: 'View commit' } : null);
    } catch (e) {
      notify(explain(e), 'err');
    } finally { busy = false; touch(); }
  }

  /* ---------- events ---------- */
  $('connectForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = $('connectBtn');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try { await login($('usernameInput').value, $('passwordInput').value, $('rememberInput').checked); }
    catch (err) {
      notify(explain(err), 'err');
      if (/not set up|environment variables/i.test(err.message || '')) $('setupHelp').open = true;
    }
    finally { btn.disabled = false; btn.textContent = 'Sign in'; }
  });
  $('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]');
    if (!b) return;
    activeTab = b.dataset.tab; render();
  });
  $('publishBtn').addEventListener('click', publishFlow);
  $('discardBtn').addEventListener('click', async function () {
    if (!changeList().length) return;
    if (!(await confirmBox('Discard changes', 'Throw away all unpublished changes and reload from GitHub?', 'Discard', true))) return;
    try { await loadFromRepo(); render(); notify('Changes discarded.', 'ok'); } catch (err) { notify(explain(err), 'err'); }
  });
  $('disconnectBtn').addEventListener('click', async function () {
    if (changeList().length && !(await confirmBox('Sign out', 'You have unpublished changes. Sign out anyway?', 'Sign out', true))) return;
    try { await authCall('logout', 'POST'); } catch (err) { /* cookie expires by itself */ }
    showLogin();
  });

  /* ---------- already signed in? (cookie from an earlier visit) ---------- */
  (async function init() {
    try {
      var r = await authCall('session', 'GET');
      if (r.ok) await enter(r.data);
      else if (r.data && r.data.code === 'setup') { notify(r.data.message, 'err'); $('setupHelp').open = true; }
    } catch (err) { notify(explain(err), 'err'); }
  })();

  window.__wtAdmin = { cleanIcon: cleanIcon, wrapToolHtml: wrapToolHtml, applySeo: applySeo, readSeo: readSeo, parseConfig: parseConfig };
})();
