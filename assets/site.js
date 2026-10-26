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
