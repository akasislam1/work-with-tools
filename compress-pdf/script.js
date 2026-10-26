// ---------- UI text (bn + en) ----------
const translations = {
  en: {
    title: "Compress PDF",
    subtitle: "Make a PDF smaller. Everything happens in your browser — your file is never uploaded.",
    dropTitle: "Drop a PDF here, or tap to choose",
    dropHint: "One file at a time",
    change: "Choose another file",
    pagesCount: (n) => `${n} ${n === 1 ? "page" : "pages"}`,
    modeLight: "Light",
    modeStrong: "Strong",
    lightNote:
      "Re-saves the PDF with a more compact internal structure. Text, links and fonts stay exactly as they are. Savings are often small, especially for scanned files or PDFs that are already optimized.",
    warnTitle: "Text will no longer be selectable.",
    warnText:
      "Strong mode turns every page into an image. You won’t be able to copy or search the text, and links and form fields are removed. Use Light mode if you need to keep the text.",
    qualityLabel: "Image quality",
    qualityStart: "Starting quality",
    qualityNote: "Lower quality gives a smaller file but blurrier pages.",
    dpiLabel: "Resolution",
    dpiNote: "72 DPI gives the smallest file, 150 DPI the sharpest pages.",
    targetLabel: "Aim for a target size",
    targetNote:
      "The tool starts at the quality above and lowers it step by step until the file is close to your target. It isn’t always possible to reach it.",
    compress: "Compress PDF",
    cancel: "Cancel",
    optimizing: "Optimizing…",
    page: (i, n) => `Processing page ${i} of ${n}…`,
    pass: (a, max, q, i, n) => `Pass ${a} of up to ${max} · quality ${q}% · page ${i} of ${n}`,
    cancelled: "Cancelled. Your file hasn’t been changed.",
    before: "Before",
    after: "After",
    saved: "Saved",
    download: "Download compressed PDF",
    downloadOriginal: "Download original PDF",
    biggerNotice: (newS, oldS) =>
      `Compressing made this file bigger (${oldS} → ${newS}), so your original file is kept unchanged.`,
    biggerHintLight: "Try Strong mode for a smaller file.",
    biggerHintStrong: "Try a lower quality or a lower resolution, or use Light mode.",
    smallGain:
      "Light mode saved very little here. That’s normal for PDFs that are already optimized or are mostly images. Strong mode can shrink them much more, but it turns the text into images.",
    targetReached: (s) => `Target reached: the file is under ${s}.`,
    targetMissed: (s) =>
      `Couldn’t get under ${s}. This is the smallest result we could make. Try a lower resolution or a larger target.`,
    langBtn: "বাংলা",
    dismiss: "Dismiss",
  },
  bn: {
    title: "PDF কম্প্রেস",
    subtitle: "PDF-এর সাইজ ছোট করুন। সবকিছু আপনার ব্রাউজারেই হয় — ফাইল কোথাও আপলোড হয় না।",
    dropTitle: "PDF এখানে ড্রপ করুন, অথবা চাপ দিয়ে বেছে নিন",
    dropHint: "একবারে একটি ফাইল",
    change: "অন্য ফাইল নিন",
    pagesCount: (n) => `${n} পেজ`,
    modeLight: "হালকা",
    modeStrong: "শক্তিশালী",
    lightNote:
      "PDF-টি আরও কম জায়গার অভ্যন্তরীণ কাঠামোতে আবার সেভ করে। লেখা, লিংক ও ফন্ট যেমন ছিল তেমনই থাকে। সাইজ কমে সাধারণত অল্প, বিশেষ করে স্ক্যান করা বা আগে থেকেই অপটিমাইজ করা PDF-এ।",
    warnTitle: "লেখা আর সিলেক্ট বা কপি করা যাবে না।",
    warnText:
      "শক্তিশালী মোডে প্রতিটি পেজ ছবিতে রূপান্তরিত হয়। তাই লেখা কপি বা সার্চ করা যাবে না, আর লিংক ও ফর্ম ফিল্ড বাদ যাবে। লেখা রাখতে চাইলে হালকা মোড ব্যবহার করুন।",
    qualityLabel: "ছবির কোয়ালিটি",
    qualityStart: "শুরুর কোয়ালিটি",
    qualityNote: "কোয়ালিটি কম হলে ফাইল ছোট হয়, কিন্তু পেজ ঝাপসা হয়।",
    dpiLabel: "রেজোলিউশন",
    dpiNote: "72 DPI-তে ফাইল সবচেয়ে ছোট, 150 DPI-তে পেজ সবচেয়ে স্পষ্ট।",
    targetLabel: "টার্গেট সাইজ ধরুন",
    targetNote:
      "টুলটি উপরের কোয়ালিটি থেকে শুরু করে ধাপে ধাপে কমায়, যতক্ষণ না ফাইল আপনার টার্গেটের কাছাকাছি পৌঁছায়। সব সময় টার্গেটে পৌঁছানো সম্ভব হয় না।",
    compress: "PDF কম্প্রেস করুন",
    cancel: "বাতিল",
    optimizing: "অপটিমাইজ হচ্ছে…",
    page: (i, n) => `${n}টির মধ্যে ${i} নম্বর পেজ প্রসেস হচ্ছে…`,
    pass: (a, max, q, i, n) => `ধাপ ${a} (সর্বোচ্চ ${max}) · কোয়ালিটি ${q}% · পেজ ${i}/${n}`,
    cancelled: "বাতিল হয়েছে। আপনার ফাইল বদলায়নি।",
    before: "আগে",
    after: "পরে",
    saved: "কমেছে",
    download: "কম্প্রেস করা PDF ডাউনলোড",
    downloadOriginal: "আসল PDF ডাউনলোড",
    biggerNotice: (newS, oldS) =>
      `কম্প্রেস করায় ফাইল আরও বড় হয়ে গেছে (${oldS} → ${newS}), তাই আপনার আসল ফাইলটিই অপরিবর্তিত রাখা হয়েছে।`,
    biggerHintLight: "ছোট ফাইলের জন্য শক্তিশালী মোড চেষ্টা করুন।",
    biggerHintStrong: "কোয়ালিটি বা রেজোলিউশন কমিয়ে দেখুন, অথবা হালকা মোড ব্যবহার করুন।",
    smallGain:
      "হালকা মোডে এখানে খুবই সামান্য কমেছে। আগে থেকে অপটিমাইজ করা বা প্রধানত ছবিওয়ালা PDF-এ এটা স্বাভাবিক। শক্তিশালী মোডে অনেক বেশি কমানো যায়, তবে লেখা ছবিতে পরিণত হয়।",
    targetReached: (s) => `টার্গেটে পৌঁছেছে: ফাইল ${s}-এর নিচে।`,
    targetMissed: (s) =>
      `${s}-এর নিচে নামানো যায়নি। এটাই আমাদের পাওয়া সবচেয়ে ছোট ফলাফল। রেজোলিউশন কমিয়ে বা টার্গেট বাড়িয়ে দেখুন।`,
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
  noPages: (name) => `“${name}” has no pages, so there is nothing to compress.`,
  targetInvalid: () => `Enter a target size greater than 0, for example 2 MB.`,
  targetTooSmall: () => `That target is too small to reach. Try at least 10 KB.`,
  targetAboveOriginal: (target, orig) =>
    `Your file is already ${orig}, which is below your target of ${target}. Choose a smaller target.`,
  pageFailed: (n) =>
    `Page ${n} couldn’t be rendered. It may be too large for your browser. Try a lower resolution or use Light mode.`,
  compressFailed: () =>
    `Something went wrong while compressing the PDF. Please try again. If it keeps happening, the file may be damaged.`,
  libMissing: () =>
    `A required library failed to load. Check your internet connection and reload the page.`,
};

// ---------- State ----------
let lang = "en";
if (!translations[lang]) lang = "en";

let mode = "light";
let dpi = 100;
let srcBytes = null;
let totalPages = 0;
let baseName = "document";
let fileName = "document.pdf";
let busy = false;
let cancelRequested = false;
let lastResult = null;

const CANCELLED = "__cancelled__";
const MAX_PIXELS = 16000000; // keeps one canvas within what phones can handle

const $ = (id) => document.getElementById(id);
const t = (key, ...args) => {
  const v = translations[lang][key];
  return typeof v === "function" ? v(...args) : v;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

// ---------- Language ----------
function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $("langBtn").textContent = t("langBtn");
  if (srcBytes) $("fileMeta").textContent = fileMetaText();
  updateUI();
  renderResult();
}
$("langBtn").addEventListener("click", () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("compresspdf-lang", lang); } catch (e) {}
  applyLanguage();
});

// ---------- Messages ----------
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
}
function setStatus(msg) { $("status").textContent = msg || ""; }
function setProgress(pct) {
  const bar = $("bar");
  bar.hidden = pct == null;
  if (pct != null) bar.value = pct;
}

// ---------- Loading a file ----------
function fileMetaText() {
  return `${t("pagesCount", totalPages)} • ${formatSize(srcBytes.length)}`;
}

async function loadFile(file) {
  if (!file || busy) return;
  $("errors").innerHTML = "";
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) { showError(errorMessages.notPdf(file.name)); return; }

  busy = true; updateUI();
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

    srcBytes = bytes;
    totalPages = doc.getPageCount();
    fileName = file.name;
    baseName = file.name.replace(/\.pdf$/i, "") || "document";
    $("fileName").textContent = file.name;
    $("fileMeta").textContent = fileMetaText();
    lastResult = null;
    setActionError(""); setStatus(""); setProgress(null);
  } catch (err) {
    console.error(err);
    showError(errorMessages.corrupt(file.name));
  } finally {
    busy = false; updateUI(); renderResult();
  }
}

const fileInput = $("fileInput"), drop = $("dropZone");
fileInput.addEventListener("change", () => { loadFile(fileInput.files[0]); fileInput.value = ""; });
$("changeBtn").addEventListener("click", () => fileInput.click());
["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (e) => loadFile(e.dataTransfer.files[0]));
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => { e.preventDefault(); if (!drop.contains(e.target)) loadFile(e.dataTransfer.files[0]); });

// ---------- Controls ----------
function updateUI() {
  const loaded = !!srcBytes;
  $("dropZone").classList.toggle("hidden", loaded);
  $("fileCard").classList.toggle("hidden", !loaded);
  $("workspace").classList.toggle("hidden", !loaded);
  $("changeBtn").disabled = busy;
  if (!loaded) return;

  document.querySelectorAll(".mode").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.mode === mode));
    b.disabled = busy;
  });
  document.querySelectorAll("[data-panel]").forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== mode));
  document.querySelectorAll(".seg").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.dpi) === dpi));
    b.disabled = busy;
  });

  const targetOn = $("targetChk").checked;
  $("qualityLabel").textContent = t(targetOn ? "qualityStart" : "qualityLabel");
  $("qualityOut").textContent = $("qualityRange").value + "%";
  $("qualityRange").disabled = busy;
  $("targetChk").disabled = busy;
  $("targetValue").disabled = busy || !targetOn;
  $("targetUnit").disabled = busy || !targetOn;

  $("goBtn").disabled = busy;
  $("cancelBtn").classList.toggle("hidden", !(busy && mode === "strong"));
}

document.querySelectorAll(".mode").forEach((b) =>
  b.addEventListener("click", () => { if (busy) return; mode = b.dataset.mode; setActionError(""); updateUI(); }));
document.querySelectorAll(".seg").forEach((b) =>
  b.addEventListener("click", () => { if (busy) return; dpi = Number(b.dataset.dpi); updateUI(); }));
$("qualityRange").addEventListener("input", updateUI);
$("targetChk").addEventListener("change", () => { setActionError(""); updateUI(); if ($("targetChk").checked) $("targetValue").focus(); });
$("targetValue").addEventListener("input", () => setActionError(""));
$("cancelBtn").addEventListener("click", () => { cancelRequested = true; });

// ---------- Compression ----------
async function compressLight() {
  setProgress(null);
  setStatus(t("optimizing"));
  await sleep(40); // let the browser paint before the blocking save
  const doc = await PDFLib.PDFDocument.load(srcBytes);
  return doc.save({ useObjectStreams: true });
}

async function renderPageJpeg(pdfjsDoc, num, dpiValue, quality, canvas) {
  const page = await pdfjsDoc.getPage(num);
  const base = page.getViewport({ scale: 1 }); // size in PDF points, rotation applied
  let scale = dpiValue / 72;
  const pixels = base.width * base.height * scale * scale;
  if (pixels > MAX_PIXELS) scale *= Math.sqrt(MAX_PIXELS / pixels);
  const vp = page.getViewport({ scale });
  canvas.width = Math.max(1, Math.floor(vp.width));
  canvas.height = Math.max(1, Math.floor(vp.height));
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", quality));
  page.cleanup();
  return { bytes: new Uint8Array(await blob.arrayBuffer()), w: base.width, h: base.height };
}

// One full pass over every page. Returns the new PDF bytes, or null if the pass was
// stopped early because the images alone already exceed the target.
async function runPass(pdfjsDoc, canvas, passDpi, qualityPct, info, abortAbove) {
  const out = await PDFLib.PDFDocument.create();
  let imageBytes = 0;
  for (let i = 1; i <= totalPages; i++) {
    if (cancelRequested) throw new Error(CANCELLED);
    setProgress(Math.round(((i - 1) / totalPages) * 100));
    setStatus(info.showPass
      ? t("pass", info.index + 1, info.count, qualityPct, i, totalPages)
      : t("page", i, totalPages));

    let r;
    try {
      r = await renderPageJpeg(pdfjsDoc, i, passDpi, qualityPct / 100, canvas);
    } catch (e) {
      console.error(e);
      const err = new Error("page failed"); err.pageNum = i; throw err;
    }
    imageBytes += r.bytes.length;
    if (abortAbove && imageBytes > abortAbove) return null;

    const img = await out.embedJpg(r.bytes);
    const page = out.addPage([r.w, r.h]);
    page.drawImage(img, { x: 0, y: 0, width: r.w, height: r.h });
    await sleep(0); // keep the page responsive on big files
  }
  setProgress(100);
  return out.save({ useObjectStreams: true });
}

function buildAttempts(startPct, startDpi, hasTarget) {
  if (!hasTarget) return [{ dpi: startDpi, q: startPct }];
  const list = [];
  for (let q = startPct; q >= 30; q -= 10) list.push({ dpi: startDpi, q });
  const floor = Math.min(startPct, 30);
  if (!list.length) list.push({ dpi: startDpi, q: startPct });
  [100, 72].filter((d) => d < startDpi).forEach((d) => list.push({ dpi: d, q: floor }));
  return list;
}

async function compressStrong(targetBytes) {
  const pdfjsDoc = await pdfjsLib.getDocument({ data: srcBytes.slice() }).promise;
  const canvas = document.createElement("canvas");
  const attempts = buildAttempts(Number($("qualityRange").value), dpi, !!targetBytes);
  let best = null;
  try {
    for (let a = 0; a < attempts.length; a++) {
      const isLast = a === attempts.length - 1;
      const { dpi: d, q } = attempts[a];
      // Earlier passes may stop early when they can't reach the target; the last one always finishes.
      const bytes = await runPass(
        pdfjsDoc, canvas, d, q,
        { index: a, count: attempts.length, showPass: !!targetBytes },
        targetBytes && !isLast ? targetBytes : 0
      );
      if (!bytes) continue;
      if (!best || bytes.length < best.length) best = bytes;
      if (!targetBytes || bytes.length <= targetBytes) break;
    }
  } finally {
    canvas.width = canvas.height = 0;
    try { pdfjsDoc.destroy(); } catch (e) {}
  }
  return best;
}

function readTarget() {
  if (mode !== "strong" || !$("targetChk").checked) return 0;
  const v = parseFloat($("targetValue").value);
  if (!isFinite(v) || v <= 0) throw new Error(errorMessages.targetInvalid());
  const bytes = Math.round(v * ($("targetUnit").value === "MB" ? 1024 * 1024 : 1024));
  if (bytes < 10 * 1024) throw new Error(errorMessages.targetTooSmall());
  if (bytes >= srcBytes.length)
    throw new Error(errorMessages.targetAboveOriginal(formatSize(bytes), formatSize(srcBytes.length)));
  return bytes;
}

$("goBtn").addEventListener("click", async () => {
  if (busy || !srcBytes) return;
  setActionError("");
  let targetBytes;
  try { targetBytes = readTarget(); }
  catch (err) { setActionError(err.message); return; }

  busy = true; cancelRequested = false; lastResult = null;
  updateUI(); renderResult();
  try {
    const bytes = mode === "light" ? await compressLight() : await compressStrong(targetBytes);
    const larger = bytes.length >= srcBytes.length;
    lastResult = {
      mode,
      origSize: srcBytes.length,
      newSize: bytes.length,
      keepOriginal: larger,
      bytes: larger ? srcBytes : bytes,
      target: targetBytes ? { bytes: targetBytes, reached: !larger && bytes.length <= targetBytes } : null,
    };
    setStatus("");
  } catch (err) {
    if (err && err.message === CANCELLED) {
      setStatus(t("cancelled"));
    } else if (err && err.pageNum) {
      setStatus(""); setActionError(errorMessages.pageFailed(err.pageNum));
    } else {
      console.error(err);
      setStatus(""); setActionError(errorMessages.compressFailed());
    }
  } finally {
    busy = false; setProgress(null); updateUI(); renderResult();
  }
});

// ---------- Result ----------
function renderResult() {
  const box = $("result");
  const r = lastResult;
  box.classList.toggle("hidden", !r);
  if (!r) return;

  const kept = r.keepOriginal;
  const savedPct = kept ? 0 : ((r.origSize - r.newSize) / r.origSize) * 100;
  $("sBefore").textContent = formatSize(r.origSize);
  $("sAfter").textContent = formatSize(kept ? r.origSize : r.newSize);
  $("sSaved").textContent = savedPct.toFixed(1) + "%";
  $("sSavedBox").classList.toggle("good", savedPct > 0);

  const msgs = $("resultMsgs");
  msgs.innerHTML = "";
  const add = (cls, text) => {
    const p = document.createElement("p");
    p.className = "msg " + cls; p.textContent = text; msgs.appendChild(p);
  };
  if (kept) {
    add("warn", t("biggerNotice", formatSize(r.newSize), formatSize(r.origSize)) + " " +
      t(r.mode === "light" ? "biggerHintLight" : "biggerHintStrong"));
  } else {
    if (r.mode === "light" && savedPct < 5) add("warn", t("smallGain"));
    if (r.target) {
      if (r.target.reached) add("ok", t("targetReached", formatSize(r.target.bytes)));
      else add("warn", t("targetMissed", formatSize(r.target.bytes)));
    }
  }
  $("downloadBtn").textContent = t(kept ? "downloadOriginal" : "download");
}

$("downloadBtn").addEventListener("click", () => {
  if (!lastResult) return;
  const url = URL.createObjectURL(new Blob([lastResult.bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = lastResult.keepOriginal ? fileName : `${baseName}_compressed.pdf`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});

// ---------- Start ----------
if (typeof PDFLib === "undefined" || typeof pdfjsLib === "undefined") {
  showError(errorMessages.libMissing());
  $("dropZone").classList.add("hidden");
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}
applyLanguage();
