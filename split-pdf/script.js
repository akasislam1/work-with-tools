// ---------- UI text (bn + en) ----------
const translations = {
  en: {
    title: "Split PDF",
    subtitle: "Cut a PDF into parts or pull out the pages you need. Everything happens in your browser — your file is never uploaded.",
    dropTitle: "Drop a PDF here, or tap to choose",
    dropHint: "One file at a time",
    change: "Choose another file",
    pagesCount: (n) => `${n} ${n === 1 ? "page" : "pages"}`,
    modeRange: "By page range",
    modeEach: "Every page",
    modeSelect: "Pick pages",
    rangeLabel: "Pages to extract",
    rangePlaceholder: "e.g. 1-3, 5, 8-10",
    rangeNote: "Separate pages and ranges with commas. Each range is saved as its own PDF.",
    combine: "Combine all ranges into one PDF",
    eachInfo: (n) => `Every page is saved as its own PDF. ${n} files will be downloaded in one ZIP.`,
    selectInfo: "Tap thumbnails to select pages. Selected pages are saved together in one PDF.",
    selectAll: "Select all",
    clearSel: "Clear",
    selectedCount: (n) => `${n} selected`,
    pagesTitle: "Pages",
    previews: (done, total) => (done < total ? `Loading previews ${done}/${total}…` : ""),
    splitRange: "Split by range",
    splitEach: (n) => `Split into ${n} files`,
    splitSelect: (n) => `Extract ${n} ${n === 1 ? "page" : "pages"}`,
    reading: "Reading PDF…",
    splitting: (i, n) => `Creating file ${i} of ${n}…`,
    zipping: "Creating ZIP…",
    doneZip: (n) => `Done — downloaded a ZIP with ${n} PDFs`,
    doneOne: "Done — downloaded your PDF",
    langBtn: "বাংলা",
    dismiss: "Dismiss",
  },
  bn: {
    title: "PDF স্প্লিট",
    subtitle: "PDF ভেঙে অংশ করুন বা দরকারি পেজ আলাদা করে নিন। সবকিছু আপনার ব্রাউজারেই হয় — ফাইল কোথাও আপলোড হয় না।",
    dropTitle: "PDF এখানে ড্রপ করুন, অথবা চাপ দিয়ে বেছে নিন",
    dropHint: "একবারে একটি ফাইল",
    change: "অন্য ফাইল নিন",
    pagesCount: (n) => `${n} পেজ`,
    modeRange: "পেজ রেঞ্জ",
    modeEach: "প্রতি পেজ",
    modeSelect: "পেজ বাছাই",
    rangeLabel: "যেসব পেজ আলাদা করবেন",
    rangePlaceholder: "যেমন 1-3, 5, 8-10",
    rangeNote: "পেজ ও রেঞ্জ কমা দিয়ে আলাদা করুন। প্রতিটি রেঞ্জ আলাদা PDF হিসেবে সেভ হবে।",
    combine: "সব রেঞ্জ জুড়ে একটি PDF বানান",
    eachInfo: (n) => `প্রতিটি পেজ আলাদা PDF হবে। ${n}টি ফাইল একটি ZIP-এ ডাউনলোড হবে।`,
    selectInfo: "থাম্বনেইলে চাপ দিয়ে পেজ বাছুন। বাছাই করা পেজগুলো একটি PDF-এ একসাথে সেভ হবে।",
    selectAll: "সব বাছুন",
    clearSel: "বাছাই মুছুন",
    selectedCount: (n) => `${n}টি বাছা হয়েছে`,
    pagesTitle: "পেজ",
    previews: (done, total) => (done < total ? `প্রিভিউ লোড হচ্ছে ${done}/${total}…` : ""),
    splitRange: "রেঞ্জ অনুযায়ী স্প্লিট",
    splitEach: (n) => `${n}টি ফাইলে স্প্লিট করুন`,
    splitSelect: (n) => `${n}টি পেজ আলাদা করুন`,
    reading: "PDF পড়া হচ্ছে…",
    splitting: (i, n) => `${n}টির মধ্যে ${i} নম্বর ফাইল তৈরি হচ্ছে…`,
    zipping: "ZIP তৈরি হচ্ছে…",
    doneZip: (n) => `সম্পন্ন — ${n}টি PDF-সহ ZIP ডাউনলোড হয়েছে`,
    doneOne: "সম্পন্ন — PDF ডাউনলোড হয়েছে",
    langBtn: "English",
    dismiss: "বন্ধ করুন",
  },
};

// Error messages are always shown in English, whichever language is selected.
const errorMessages = {
  notPdf: (name) => `“${name}” isn’t a PDF file. Please choose a .pdf file.`,
  password: (name) =>
    `“${name}” is password-protected and can’t be read. Remove the password in a PDF viewer, save an unlocked copy, then add it again.`,
  corrupt: (name) =>
    `“${name}” looks damaged or isn’t a valid PDF. Try downloading or exporting the file again, then re-add it.`,
  noPages: (name) => `“${name}” has no pages, so there is nothing to split.`,
  rangeEmpty: () => `Enter the pages you want, for example 1-3, 5, 8-10.`,
  rangeEmptyEntry: () => `There is an empty entry in your list. Remove any extra commas, for example 1-3, 5, 8-10.`,
  rangeBadToken: (tok) =>
    `“${tok}” isn’t a valid page or range. Use numbers and dashes separated by commas, for example 1-3, 5, 8-10.`,
  rangeZero: (tok) => `Page numbers start at 1, so “${tok}” isn’t valid.`,
  rangeBackwards: (a, b) => `The range ${a}-${b} is backwards. Write the smaller number first, for example ${b}-${a}.`,
  rangeOutPage: (p, total) => `Page ${p} doesn’t exist — this PDF has only ${total} ${total === 1 ? "page" : "pages"}.`,
  rangeOutRange: (a, b, total) =>
    `The range ${a}-${b} goes past the last page — this PDF has only ${total} ${total === 1 ? "page" : "pages"}.`,
  noSelection: () => `No pages selected. Tap at least one thumbnail to choose a page.`,
  splitFailed: () =>
    `Something went wrong while splitting the PDF. Please try again. If it keeps happening, the file may be damaged.`,
  libMissing: () =>
    `A required library failed to load. Check your internet connection and reload the page.`,
};

// ---------- State ----------
let lang = "en";
if (!translations[lang]) lang = "en";

let mode = "range";
let srcBytes = null;      // Uint8Array of the uploaded PDF
let srcDoc = null;        // pdf-lib document (used for splitting)
let pdfjsDoc = null;      // PDF.js document (used for thumbnails)
let totalPages = 0;
let baseName = "document";
let selected = new Set(); // 1-based page numbers (pick mode)
let busy = false;
let loadToken = 0;        // changes whenever a new file is loaded; stale work stops
let thumbsDone = 0;

const $ = (id) => document.getElementById(id);
const t = (key, ...args) => {
  const v = translations[lang][key];
  return typeof v === "function" ? v(...args) : v;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Language ----------
function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $("langBtn").textContent = t("langBtn");
  $("rangeInput").placeholder = t("rangePlaceholder");
  if (srcDoc) $("fileMeta").textContent = fileMetaText();
  updateUI();
}
$("langBtn").addEventListener("click", () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("splitpdf-lang", lang); } catch (e) {}
  applyLanguage();
});

// ---------- Errors ----------
function showError(message) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = message;
  const x = document.createElement("button");
  x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", t("dismiss"));
  x.addEventListener("click", () => li.remove());
  li.append(span, x);
  $("errors").appendChild(li);
}
function setActionError(msg) {
  const el = $("actionError");
  el.textContent = msg || "";
  el.classList.toggle("hidden", !msg);
  $("rangeInput").setAttribute("aria-invalid", msg && mode === "range" ? "true" : "false");
}
function setStatus(msg) { $("status").textContent = msg || ""; }
function setProgress(pct) {
  const bar = $("bar");
  bar.hidden = pct == null;
  if (pct != null) bar.value = pct;
}

// ---------- Loading a file ----------
function fileMetaText() {
  const mb = srcBytes.length / 1024 / 1024;
  const size = mb < 1 ? Math.max(1, Math.round(srcBytes.length / 1024)) + " KB" : mb.toFixed(1) + " MB";
  return `${t("pagesCount", totalPages)} • ${size}`;
}

async function loadFile(file) {
  if (!file || busy) return;
  $("errors").innerHTML = "";
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) { showError(errorMessages.notPdf(file.name)); return; }

  busy = true; updateUI(); setStatus(t("reading"));
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let doc;
    try {
      doc = await PDFLib.PDFDocument.load(bytes); // throws on encrypted or broken files
    } catch (err) {
      const enc = err && (err.name === "EncryptedPDFError" || /encrypt/i.test(String(err.message)));
      showError(enc ? errorMessages.password(file.name) : errorMessages.corrupt(file.name));
      return;
    }
    if (doc.getPageCount() === 0) { showError(errorMessages.noPages(file.name)); return; }

    resetDocument();
    srcBytes = bytes; srcDoc = doc; totalPages = doc.getPageCount();
    baseName = file.name.replace(/\.pdf$/i, "") || "document";
    $("fileName").textContent = file.name;
    $("fileMeta").textContent = fileMetaText();
    $("rangeInput").value = "";
    selected = new Set();
    const token = loadToken;

    try {
      pdfjsDoc = await pdfjsLib.getDocument({ data: srcBytes.slice() }).promise;
    } catch (e) {
      pdfjsDoc = null; // previews unavailable, splitting still works
    }
    buildGrid(token);
  } catch (err) {
    console.error(err);
    showError(errorMessages.corrupt(file.name));
  } finally {
    busy = false; setStatus(""); updateUI();
  }
}

function resetDocument() {
  loadToken++;
  queue = []; pumping = false; thumbsDone = 0;
  if (observer) observer.disconnect();
  if (pdfjsDoc) { try { pdfjsDoc.destroy(); } catch (e) {} }
  pdfjsDoc = null; srcDoc = null; srcBytes = null; totalPages = 0;
  $("grid").innerHTML = "";
  setActionError("");
}

// ---------- Thumbnails (rendered lazily, one at a time) ----------
let observer = null;
let queue = [];
let pumping = false;

function buildGrid(token) {
  const grid = $("grid");
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let n = 1; n <= totalPages; n++) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "thumb"; b.dataset.page = n;
    b.setAttribute("aria-label", `${n}`);
    const box = document.createElement("div"); box.className = "box";
    const ph = document.createElement("span"); ph.className = "ph"; ph.textContent = n;
    const canvas = document.createElement("canvas");
    box.append(ph, canvas);
    const num = document.createElement("span"); num.className = "num"; num.textContent = n;
    b.append(box, num);
    frag.appendChild(b);
  }
  grid.appendChild(frag);

  if (!pdfjsDoc) return;
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const cell = e.target;
      if (e.isIntersecting) {
        if (!queue.includes(cell)) queue.push(cell);
      } else {
        queue = queue.filter((c) => c !== cell); // scrolled away before its turn
      }
    }
    pump(token);
  }, { rootMargin: "300px" });
  grid.querySelectorAll(".thumb").forEach((c) => observer.observe(c));
  showThumbProgress();
}

async function pump(token) {
  if (pumping) return;
  pumping = true;
  while (queue.length) {
    if (token !== loadToken) return;
    const cell = queue.shift();
    await renderThumb(cell, token);
    if (token !== loadToken) return;
    await sleep(20); // let the browser breathe between pages
  }
  pumping = false;
}

async function renderThumb(cell, token) {
  const doc = pdfjsDoc;
  try {
    const page = await doc.getPage(Number(cell.dataset.page));
    const vp0 = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: 200 / vp0.width });
    const canvas = cell.querySelector("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
    page.cleanup();
    if (token !== loadToken) return;
    cell.classList.add("ready");
  } catch (e) {
    if (token !== loadToken) return;
    // leave the numbered placeholder; the page can still be split
  }
  if (token === loadToken) {
    if (observer) observer.unobserve(cell);
    thumbsDone++;
    showThumbProgress();
  }
}

function showThumbProgress() {
  $("thumbProgress").textContent = t("previews", thumbsDone, totalPages);
}

// ---------- Range parsing ----------
function parseRanges(text) {
  const clean = text.replace(/[–—]/g, "-").trim();
  if (!clean) throw new Error(errorMessages.rangeEmpty());
  const parts = clean.split(",").map((s) => s.trim());
  const ranges = [];
  for (const part of parts) {
    if (part === "") throw new Error(errorMessages.rangeEmptyEntry());
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error(errorMessages.rangeBadToken(part));
    const from = parseInt(m[1], 10);
    const isRange = m[2] !== undefined;
    const to = isRange ? parseInt(m[2], 10) : from;
    if (from === 0 || to === 0) throw new Error(errorMessages.rangeZero(part));
    if (isRange && from > to) throw new Error(errorMessages.rangeBackwards(from, to));
    if (isRange && to > totalPages) throw new Error(errorMessages.rangeOutRange(from, to, totalPages));
    if (!isRange && from > totalPages) throw new Error(errorMessages.rangeOutPage(from, totalPages));
    ranges.push({ from, to, label: isRange ? `${from}-${to}` : `${from}` });
  }
  return ranges;
}

// ---------- UI state ----------
function refreshMarks() {
  const hl = new Set();
  if (mode === "range") {
    try { parseRanges($("rangeInput").value).forEach((r) => { for (let p = r.from; p <= r.to; p++) hl.add(p); }); } catch (e) {}
  }
  document.querySelectorAll("#grid .thumb").forEach((c) => {
    const n = Number(c.dataset.page);
    c.classList.toggle("hl", mode === "range" && hl.has(n));
    c.classList.toggle("sel", mode === "select" && selected.has(n));
    c.setAttribute("aria-pressed", mode === "select" ? String(selected.has(n)) : "false");
  });
}

function updateUI() {
  const loaded = !!srcDoc;
  $("dropZone").classList.toggle("hidden", loaded);
  $("fileCard").classList.toggle("hidden", !loaded);
  $("workspace").classList.toggle("hidden", !loaded);
  $("changeBtn").disabled = busy;
  if (!loaded) return;

  document.querySelectorAll(".mode").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  document.querySelectorAll("[data-panel]").forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== mode));
  $("grid").classList.toggle("selectable", mode === "select");
  $("eachInfo").textContent = t("eachInfo", totalPages);
  $("selCount").textContent = t("selectedCount", selected.size);
  showThumbProgress();

  const btn = $("splitBtn");
  if (mode === "range") btn.textContent = t("splitRange");
  else if (mode === "each") btn.textContent = t("splitEach", totalPages);
  else btn.textContent = t("splitSelect", selected.size);
  btn.disabled = busy || (mode === "select" && selected.size === 0);
  refreshMarks();
}

document.querySelectorAll(".mode").forEach((b) =>
  b.addEventListener("click", () => { if (busy) return; mode = b.dataset.mode; setActionError(""); updateUI(); }));
$("rangeInput").addEventListener("input", () => { setActionError(""); refreshMarks(); });
$("rangeInput").addEventListener("keydown", (e) => { if (e.key === "Enter") $("splitBtn").click(); });

$("grid").addEventListener("click", (e) => {
  const cell = e.target.closest(".thumb");
  if (!cell || mode !== "select" || busy) return;
  const n = Number(cell.dataset.page);
  if (selected.has(n)) selected.delete(n); else selected.add(n);
  setActionError("");
  updateUI();
});
$("selAllBtn").addEventListener("click", () => { for (let n = 1; n <= totalPages; n++) selected.add(n); setActionError(""); updateUI(); });
$("selNoneBtn").addEventListener("click", () => { selected.clear(); updateUI(); });

// ---------- File input / drag & drop ----------
const fileInput = $("fileInput"), drop = $("dropZone");
fileInput.addEventListener("change", () => { loadFile(fileInput.files[0]); fileInput.value = ""; });
$("changeBtn").addEventListener("click", () => fileInput.click());
["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (e) => loadFile(e.dataTransfer.files[0]));
// Dropping a file on the file card or anywhere else also loads it (and never opens it in the browser)
["dragover"].forEach((ev) => window.addEventListener(ev, (e) => e.preventDefault()));
window.addEventListener("drop", (e) => { e.preventDefault(); if (e.target !== drop && !drop.contains(e.target)) loadFile(e.dataTransfer.files[0]); });

// ---------- Splitting ----------
function buildJobs() {
  if (mode === "range") {
    const ranges = parseRanges($("rangeInput").value); // throws a clear English error
    const idx = (r) => Array.from({ length: r.to - r.from + 1 }, (_, i) => r.from - 1 + i);
    if ($("combineChk").checked || ranges.length === 1) {
      const label = ranges.map((r) => r.label).join("_");
      const tag = label.length > 40 ? "selected" : label;
      return [{ name: `${baseName}_pages_${tag}.pdf`, indices: ranges.flatMap(idx) }];
    }
    return ranges.map((r, i) => ({ name: `${baseName}_part${i + 1}_pages_${r.label}.pdf`, indices: idx(r) }));
  }
  if (mode === "each") {
    const width = String(totalPages).length;
    return Array.from({ length: totalPages }, (_, i) => ({
      name: `${baseName}_page_${String(i + 1).padStart(width, "0")}.pdf`,
      indices: [i],
    }));
  }
  if (selected.size === 0) throw new Error(errorMessages.noSelection());
  const pages = Array.from(selected).sort((a, b) => a - b);
  return [{ name: `${baseName}_selected_pages.pdf`, indices: pages.map((p) => p - 1) }];
}

async function makePdf(indices) {
  const out = await PDFLib.PDFDocument.create();
  const copied = await out.copyPages(srcDoc, indices);
  copied.forEach((p) => out.addPage(p));
  return out.save();
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

$("splitBtn").addEventListener("click", async () => {
  if (busy || !srcDoc) return;
  setActionError("");
  let jobs;
  try { jobs = buildJobs(); }
  catch (err) { setActionError(err.message); return; }

  busy = true; updateUI();
  try {
    const results = [];
    for (let i = 0; i < jobs.length; i++) {
      setStatus(t("splitting", i + 1, jobs.length));
      setProgress(Math.round((i / jobs.length) * 100));
      results.push({ name: jobs[i].name, bytes: await makePdf(jobs[i].indices) });
      await sleep(0); // keep the page responsive on big files
    }
    if (results.length === 1) {
      download(new Blob([results[0].bytes], { type: "application/pdf" }), results[0].name);
      setStatus(t("doneOne"));
    } else {
      setStatus(t("zipping"));
      const zip = new JSZip();
      results.forEach((r) => zip.file(r.name, r.bytes));
      const blob = await zip.generateAsync({ type: "blob" }, (m) => setProgress(Math.round(m.percent)));
      download(blob, `${baseName}_split.zip`);
      setStatus(t("doneZip", results.length));
    }
  } catch (err) {
    console.error(err);
    setStatus("");
    setActionError(errorMessages.splitFailed());
  } finally {
    busy = false; setProgress(null); updateUI();
  }
});

// ---------- Start ----------
if (typeof PDFLib === "undefined" || typeof pdfjsLib === "undefined" || typeof JSZip === "undefined") {
  showError(errorMessages.libMissing());
  $("dropZone").classList.add("hidden");
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}
applyLanguage();
