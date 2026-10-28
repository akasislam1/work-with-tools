/* Shared footer + "paused" screen for every page. Reads tools.js (managed by /admin/). */
(function () {
  var tools = window.TOOLS || [], cats = window.TOOL_CATS || [], site = window.SITE || {};
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* Paused tool: cover the page with a friendly message (tool pages live at /<slug>/) */
  var slug = location.pathname.split("/").filter(Boolean)[0];
  var me = tools.filter(function (t) { return t.slug === slug; })[0];
  if (me && me.status === "paused") {
    var o = document.createElement("div");
    o.className = "wt-pause";
    o.setAttribute("role", "alert");
    o.innerHTML = '<div class="wt-pause-box"><a class="wt-logo" href="/"><span class="wt-mark">W</span>Work With Tools</a>' +
      '<h1>' + esc(me.name) + ' is paused</h1>' +
      '<p>' + esc(me.pauseNote || "This tool is temporarily unavailable. Please check back soon.") + '</p>' +
      '<a class="wt-btn" href="/">Browse other tools</a></div>';
    document.body.appendChild(o);
    document.documentElement.style.overflow = "hidden";
  }

  /* Ads: configured in /admin/ (window.ADS). Nothing is shown unless ads are switched on there. */
  var ADS = window.ADS || {};
  var noAds = !!(me && me.status === "paused") || !!document.querySelector(".wt-404");
  function okUrl(u) { return /^(https:\/\/[^\s]+|\/[^\s]*)$/.test(u || ""); }
  function adNode(key) {
    var a = ADS.slots && ADS.slots[key];
    if (noAds || !ADS.enabled || !a || !a.on) return null;
    var box = document.createElement("aside");
    box.className = "wt-ad";
    box.setAttribute("aria-label", "Advertisement");
    var label = document.createElement("span");
    label.className = "wt-ad-label";
    label.textContent = "Advertisement";
    var body = document.createElement("div");
    body.className = "wt-ad-body";
    if (a.type === "banner") {
      if (!okUrl(a.img) || !okUrl(a.link)) return null;
      var link = document.createElement("a");
      link.href = a.link; link.target = "_blank"; link.rel = "sponsored noopener";
      var img = document.createElement("img");
      img.src = a.img; img.alt = a.alt || ""; img.loading = "lazy";
      link.appendChild(img); body.appendChild(link);
    } else {
      if (!a.code) return null;
      var r = document.createRange();
      r.selectNodeContents(body);
      body.appendChild(r.createContextualFragment(a.code)); // runs the ad network's script
    }
    box.append(label, body);
    return box;
  }
  if (!noAds && ADS.enabled && /^ca-pub-\d{10,20}$/.test(ADS.adsenseClient || "")) {
    var ga = document.createElement("script");
    ga.async = true; ga.crossOrigin = "anonymous";
    ga.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADS.adsenseClient;
    document.head.appendChild(ga);
  }
  var sections = document.getElementById("sections");
  if (sections) { // home page
    var homeMain = document.getElementById("tools"), top = adNode("homeTop"), mid = adNode("homeMiddle");
    if (top && homeMain) homeMain.parentNode.insertBefore(top, homeMain);
    var firstSec = sections.querySelector(".wt-sec");
    if (mid && firstSec && sections.querySelectorAll(".wt-sec").length > 1) firstSec.parentNode.insertBefore(mid, firstSec.nextSibling);
  } else if (document.querySelector(".wt-bar")) { // tool pages
    var tt = adNode("toolTop"), tb = adNode("toolBottom");
    if (tt) { var bar = document.querySelector(".wt-bar"); bar.parentNode.insertBefore(tt, bar.nextSibling); }
    if (tb) document.body.appendChild(tb);
  }

  /* Premium: free-plan limits and the Premium / Account link. The limits are set in /admin/ > Premium and only apply while they are switched on there.
     This runs before the visit counting below so that a blocked selection is not counted as a use. */
  (function () {
    if (document.querySelector(".wt-404") || (me && me.status === "paused")) return;
    var onTool = !!me, avail = false, premium = false, limits = null, used = 0;
    var dayKey = new Date().toISOString().slice(0, 10), lsKey = "wt_q_" + slug;
    function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
    var q = lsGet(lsKey); used = q && q.d === dayKey ? q.n : 0;
    var known = lsGet("wt_plan"); // last answer from the server, so the limits also hold while the first request is loading
    if (known && Date.now() - known.t < 3600000) { avail = !!known.avail; premium = !!known.premium; limits = known.limits || null; }

    var css = document.createElement("style");
    css.textContent = ".wt-lim{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;background:rgba(12,26,58,.55);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
      ".wt-lim-box{max-width:420px;width:100%;background:#fff;color:#0c1a3a;border-radius:16px;padding:22px;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}" +
      ".wt-lim-box h2{margin:0 0 8px;font-size:1.25rem}.wt-lim-box p{margin:0 0 16px;line-height:1.5}.wt-lim-act{display:flex;gap:10px;flex-wrap:wrap}" +
      ".wt-lim-act a,.wt-lim-act button{border:0;border-radius:10px;padding:10px 16px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none}" +
      ".wt-lim-go{background:#1f4bd8;color:#fff}.wt-lim-x{background:#eef3ff;color:#0c1a3a}";
    document.head.appendChild(css);

    function showLimit(msg) {
      var old = document.querySelector(".wt-lim"); if (old) old.remove();
      var o = document.createElement("div"); o.className = "wt-lim"; o.setAttribute("role", "alertdialog"); o.setAttribute("aria-modal", "true");
      var box = document.createElement("div"); box.className = "wt-lim-box";
      var t = document.createElement("h2"); t.textContent = "Free plan limit";
      var p = document.createElement("p"); p.textContent = msg + (avail ? " Premium has no limits." : "");
      var act = document.createElement("div"); act.className = "wt-lim-act";
      if (avail) { var go = document.createElement("a"); go.className = "wt-lim-go"; go.href = "/premium/"; go.textContent = "Go Premium"; act.appendChild(go); }
      var x = document.createElement("button"); x.type = "button"; x.className = "wt-lim-x"; x.textContent = "Close";
      x.addEventListener("click", function () { o.remove(); });
      act.appendChild(x); box.append(t, p, act); o.appendChild(box); document.body.appendChild(o); x.focus();
    }
    function gate(e, files, input) {
      if (!onTool || premium || !limits || !files || !files.length) return;
      var n = files.length, msg = "";
      if (n > limits.maxFilesBatch) msg = "The free plan allows up to " + limits.maxFilesBatch + " files at a time. You chose " + n + ".";
      if (!msg) for (var i = 0; i < n; i++) if (files[i].size > limits.maxFileMB * 1048576) { msg = "The free plan allows files up to " + limits.maxFileMB + " MB. \u201c" + files[i].name + "\u201d is bigger."; break; }
      if (!msg && used + n > limits.maxFilesDay) msg = "You have " + Math.max(0, limits.maxFilesDay - used) + " of " + limits.maxFilesDay + " free files left for this tool today. The limit resets at 00:00 UTC.";
      if (msg) { e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault(); if (input) input.value = ""; showLimit(msg); return; }
      used += n; lsSet(lsKey, { d: dayKey, n: used });
      try { fetch("/api/acct?action=use", { method: "POST", credentials: "same-origin", keepalive: true, headers: { "Content-Type": "application/json", "X-WT": "1" }, body: JSON.stringify({ slug: slug, n: n }) }); } catch (err) { /* ignore */ }
    }
    document.addEventListener("change", function (e) { var el = e.target; if (el && el.type === "file") gate(e, el.files, el); }, true);
    document.addEventListener("drop", function (e) { gate(e, e.dataTransfer && e.dataTransfer.files, null); }, true);

    /* ----- header: Log in / Sign up / Get Premium (or the member's account menu) ----- */
    var enabled = false, userInfo = null, allLink = null, navCss = null;
    function nextParam() { var cur = location.pathname + location.search; if (cur.indexOf("/login") === 0) cur = "/"; return "?next=" + encodeURIComponent(cur); }
    function closeMenu() { var m = document.querySelector(".wt-menu"); if (m) m.remove(); var b = document.querySelector(".wt-nav [aria-expanded]"); if (b) b.setAttribute("aria-expanded", "false"); }
    function openMenu(btn, items) {
      var was = !!document.querySelector(".wt-menu"); closeMenu(); if (was) return;
      var m = document.createElement("div"); m.className = "wt-menu"; m.setAttribute("role", "menu");
      items.forEach(function (it) {
        var el;
        if (it.href) { el = document.createElement("a"); el.href = it.href; }
        else if (it.onclick) { el = document.createElement("button"); el.type = "button"; el.addEventListener("click", it.onclick); }
        else { el = document.createElement("div"); el.className = "wt-m-email"; }
        el.textContent = it.text; m.appendChild(el);
      });
      document.querySelector(".wt-bar").appendChild(m); btn.setAttribute("aria-expanded", "true");
    }
    function signOut() {
      try { fetch("/api/acct?action=logout", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-WT": "1" }, body: "{}" })
        .then(function () { lsSet("wt_plan", null); location.reload(); }).catch(function () { location.reload(); }); } catch (e) { location.reload(); }
    }
    function buildNav() {
      var bar = document.querySelector(".wt-bar");
      if (!bar || !enabled || location.pathname.indexOf("/login") === 0) return;
      if (!allLink) allLink = bar.querySelector(".wt-all");
      if (!allLink) return;
      if (!navCss) {
        navCss = document.createElement("style");
        navCss.textContent = ".wt-nav{display:flex;gap:8px;align-items:center}" +
          ".wt-nav a,.wt-nav button{font:inherit;font-size:14px;font-weight:600;border:0;border-radius:8px;padding:7px 12px;cursor:pointer;text-decoration:none;line-height:1.2;color:#fff;background:rgba(255,255,255,.14)}" +
          ".wt-nav a:hover,.wt-nav button:hover{background:rgba(255,255,255,.26)}" +
          ".wt-nav .wt-n-up{background:#fff;color:#0c1a3a}.wt-nav .wt-n-up:hover{background:#eef3ff}" +
          ".wt-nav .wt-n-prem{background:#f5a524;color:#0c1a3a}.wt-nav .wt-n-prem:hover{background:#ffb93d}" +
          ".wt-nav .wt-n-av{width:34px;height:34px;padding:0;border-radius:50%;background:#fff;color:#1f4bd8;font-weight:800}" +
          ".wt-menu{position:absolute;right:12px;top:calc(100% + 6px);min-width:210px;background:#fff;color:#0c1a3a;border-radius:12px;box-shadow:0 18px 40px -12px rgba(0,0,0,.35);padding:6px;z-index:70;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
          ".wt-menu a,.wt-menu button,.wt-menu div{display:block;width:100%;box-sizing:border-box;text-align:left;border:0;background:none;color:#0c1a3a;font:inherit;font-size:14px;padding:9px 12px;border-radius:8px;text-decoration:none;cursor:pointer}" +
          ".wt-menu a:hover,.wt-menu button:hover{background:#eef3ff}.wt-menu .wt-m-email{color:#506080;font-size:13px;cursor:default;overflow-wrap:anywhere}" +
          "@media (max-width:640px){.wt-nav .wt-hide-sm{display:none}.wt-nav a,.wt-nav button{padding:6px 10px;font-size:13px}}" +
          "@media (min-width:641px){.wt-nav .wt-show-sm{display:none}}";
        document.head.appendChild(navCss);
        document.addEventListener("click", function (e) { if (!e.target.closest(".wt-menu") && !e.target.closest(".wt-nav [aria-expanded]")) closeMenu(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
      }
      var nav = bar.querySelector(".wt-nav");
      if (nav) nav.replaceChildren(); else { nav = document.createElement("div"); nav.className = "wt-nav"; allLink.parentNode.insertBefore(nav, allLink); }
      allLink.classList.add("wt-hide-sm"); nav.appendChild(allLink);
      function a(cls, href, text) { var el = document.createElement("a"); el.className = cls; el.href = href; el.textContent = text; return el; }
      var prem = a("wt-n-prem", "/premium/", userInfo && userInfo.premium ? "\u2605 Premium" : "Get Premium");
      if (userInfo) {
        var av = document.createElement("button"); av.type = "button"; av.className = "wt-n-av"; av.setAttribute("aria-label", "Account menu"); av.setAttribute("aria-haspopup", "true"); av.setAttribute("aria-expanded", "false");
        av.textContent = String(userInfo.email || "?").charAt(0).toUpperCase();
        av.addEventListener("click", function () {
          openMenu(av, [{ text: userInfo.email }, { text: userInfo.premium ? "My plan (Premium)" : "My plan", href: "/premium/" }, { text: "All tools", href: "/" }, { text: "Sign out", onclick: signOut }]);
        });
        nav.append(prem, av);
      } else {
        var menu = document.createElement("button"); menu.type = "button"; menu.className = "wt-show-sm"; menu.setAttribute("aria-haspopup", "true"); menu.setAttribute("aria-expanded", "false"); menu.textContent = "Menu \u25BE";
        menu.addEventListener("click", function () {
          openMenu(menu, [{ text: "Log in", href: "/login/" + nextParam() }, { text: "Sign up", href: "/login/" + nextParam() + "&mode=signup" }, { text: "All tools", href: "/" }]);
        });
        var login = a("wt-hide-sm", "/login/" + nextParam(), "Log in"), signup = a("wt-n-up wt-hide-sm", "/login/" + nextParam() + "&mode=signup", "Sign up");
        nav.append(login, signup, prem, menu);
      }
    }
    function apply(d) {
      avail = !!d.available; premium = !!(d.user && d.user.premium); limits = d.enforce ? d.limits : null;
      enabled = d.enabled !== false && (d.enabled === true || !!d.available); userInfo = d.user || null;
      if (typeof d.used === "number") { used = Math.max(used, d.used); lsSet(lsKey, { d: dayKey, n: used }); }
      lsSet("wt_plan", { t: Date.now(), avail: avail, enabled: enabled, premium: premium, limits: limits, email: userInfo ? userInfo.email : "" });
      if (premium) document.querySelectorAll(".wt-ad").forEach(function (n) { n.remove(); });
      closeMenu(); buildNav();
    }
    // draw the header straight away from what we knew last time, then correct it when the server answers
    if (known && known.enabled && Date.now() - known.t < 7 * 86400000) { enabled = true; userInfo = known.email ? { email: known.email, premium: !!known.premium } : null; buildNav(); }
    try {
      fetch("/api/acct?action=me&slug=" + encodeURIComponent(onTool ? slug : ""), { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { if (d) apply(d); }).catch(function () { /* offline: keep what we knew */ });
    } catch (e) { /* ignore */ }
  })();

  /* Visit counting: anonymous, no cookies. Skipped for the owner (set when signing in to /admin/) and for "Do Not Track" browsers. */
  (function () {
    var skip = false;
    try { skip = localStorage.getItem("wt_no_track") === "1"; } catch (e) { /* ignore */ }
    if (skip || navigator.doNotTrack === "1" || document.querySelector(".wt-404")) return;
    function send(t) {
      var body = JSON.stringify({ t: t, p: location.pathname, r: t === "pv" ? document.referrer : "" });
      try { if (navigator.sendBeacon && navigator.sendBeacon("/api/hit", new Blob([body], { type: "application/json" }))) return; } catch (e) { /* fall through */ }
      try { fetch("/api/hit", { method: "POST", body: body, headers: { "Content-Type": "application/json" }, keepalive: true }); } catch (e) { /* ignore */ }
    }
    send("pv");
    if (document.getElementById("sections")) return; // home page: page view only
    var last = {};
    function once(t) { var n = Date.now(); if (last[t] && n - last[t] < 3000) return; last[t] = n; send(t); }
    document.addEventListener("change", function (e) { var el = e.target; if (el && el.type === "file" && el.files && el.files.length) once("use"); }, true);
    document.addEventListener("drop", function (e) { var f = e.dataTransfer && e.dataTransfer.files; if (f && f.length) once("use"); }, true);
    document.addEventListener("click", function (e) { var a = e.target && e.target.closest && e.target.closest("a[download]"); if (a) once("dl"); }, true);
  })();

  /* Footer: only live tools are listed */
  function col(cat) {
    var live = tools.filter(function (t) { return t.cat === cat.id && t.status === "live"; });
    if (!live.length) return "";
    return '<div><h3>' + esc(cat.title) + '</h3><ul>' + live.map(function (t) {
      return '<li><a href="/' + esc(t.slug) + '/">' + esc(t.name) + '</a></li>';
    }).join("") + '</ul></div>';
  }
  var blurb = site.footerText || "Free image and PDF tools that run in your browser. Your files stay on your device.";
  var f = document.createElement("footer");
  f.className = "wt-foot";
  f.innerHTML =
    '<div class="wt-foot-in">' +
      '<div class="wt-foot-brand"><a class="wt-logo" href="/"><span class="wt-mark">W</span>Work With Tools</a><p>' + esc(blurb) + '</p></div>' +
      cats.map(col).join("") +
    '</div><div class="wt-foot-base">© ' + new Date().getFullYear() + ' Work With Tools</div>';
  document.body.appendChild(f);
})();
