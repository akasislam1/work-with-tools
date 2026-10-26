// ---------- UI text (bn + en) ----------
const translations = {
  en: {
    title: "Merge PDF",
    subtitle: "Combine several PDFs into one. Everything happens in your browser — files are never uploaded.",
    dropTitle: "Drop PDF files here, or tap to choose",
    dropHint: "You can select multiple files at once",
    listTitle: (n) => `Files (${n})`,
    clearAll: "Remove all",
    dragHint: "Drag the ⋮⋮ handle to change the order.",
    empty: "No files yet. Add at least two PDFs to merge.",
    pages: (n) => `${n} ${n === 1 ? "page" : "pages"}`,
    remove: "Remove",
    removeLabel: (name) => `Remove ${name}`,
    merge: "Merge PDFs",
    needTwo: "Add at least 2 files to merge",
    reading: "Reading files…",
    merging: "Merging…",
    done: (n) => `Done — merged ${n} pages into merged.pdf`,
    langBtn: "বাংলা",
    dismiss: "Dismiss",
  },
  bn: {
    title: "PDF মার্জ",
    subtitle: "একাধিক PDF জুড়ে একটি PDF বানান। সবকিছু আপনার ব্রাউজারেই হয় — ফাইল কোথাও আপলোড হয় না।",
    dropTitle: "PDF ফাইল এখানে ড্রপ করুন, অথবা চাপ দিয়ে বেছে নিন",
    dropHint: "একসাথে একাধিক ফাইল নেওয়া যাবে",
    listTitle: (n) => `ফাইল (${n})`,
    clearAll: "সব মুছুন",
    dragHint: "ক্রম বদলাতে ⋮⋮ হ্যান্ডেল ধরে টানুন।",
    empty: "এখনো কোনো ফাইল নেই। মার্জ করতে অন্তত দুটি PDF দিন।",
    pages: (n) => `${n} পেজ`,
    remove: "মুছুন",
    removeLabel: (name) => `${name} মুছুন`,
    merge: "PDF মার্জ করুন",
    needTwo: "মার্জ করতে অন্তত ২টি ফাইল দিন",
    reading: "ফাইল পড়া হচ্ছে…",
    merging: "মার্জ হচ্ছে…",
    done: (n) => `সম্পন্ন — ${n} পেজ merged.pdf-এ জোড়া হয়েছে`,
    langBtn: "English",
    dismiss: "বন্ধ করুন",
  },
};

// Error messages are always shown in English, whichever language is selected.
const errorMessages = {
  password: (name) =>
    `“${name}” is password-protected and can’t be read. Remove the password in a PDF viewer, save an unlocked copy, then add it again.`,
  corrupt: (name) =>
    `“${name}” looks damaged or isn’t a valid PDF. Try downloading or exporting the file again, then re-add it.`,
  notPdf: (name) => `“${name}” isn’t a PDF file. Only .pdf files can be merged.`,
  noPages: (name) => `“${name}” has no pages, so there is nothing to merge.`,
  mergeFailed: (name) =>
    name
      ? `Couldn’t merge because “${name}” failed while being combined. Remove it and try again.`
      : `Something went wrong while merging. Please try again.`,
};

// ---------- State ----------
let lang = "en";
if (!translations[lang]) lang = "en";

let files = []; // { id, name, size, pages, bytes }
let nextId = 1;
let busy = false;

const $ = (id) => document.getElementById(id);
const list = $("list"), errorsEl = $("errors"), statusEl = $("status");
const t = (key, ...args) => {
  const v = translations[lang][key];
  return typeof v === "function" ? v(...args) : v;
};

// ---------- Rendering ----------
function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $("langBtn").textContent = t("langBtn");
  render();
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function render() {
  const has = files.length > 0;
  $("listSection").classList.toggle("hidden", !has);
  $("empty").classList.toggle("hidden", has);
  $("listTitle").textContent = t("listTitle", files.length);

  list.innerHTML = "";
  files.forEach((f) => {
    const li = document.createElement("li");
    li.dataset.id = f.id;

    const handle = document.createElement("span");
    handle.className = "handle";
    handle.textContent = "⋮⋮";
    handle.setAttribute("aria-hidden", "true");

    const info = document.createElement("div");
    info.className = "info";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = f.name;
    name.title = f.name;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${t("pages", f.pages)} • ${formatSize(f.size)}`;
    info.append(name, meta);

    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "remove";
    rm.textContent = t("remove");
    rm.setAttribute("aria-label", t("removeLabel", f.name));
    rm.addEventListener("click", () => {
      files = files.filter((x) => x.id !== f.id);
      setStatus("");
      render();
    });

    li.append(handle, info, rm);
    list.appendChild(li);
  });

  const btn = $("mergeBtn");
  btn.textContent = files.length < 2 ? t("needTwo") : `${t("merge")} (${files.length})`;
  btn.disabled = files.length < 2 || busy;
}

function setStatus(msg) { statusEl.textContent = msg; }

function showError(message) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = message;
  const x = document.createElement("button");
  x.type = "button";
  x.textContent = "×";
  x.setAttribute("aria-label", t("dismiss"));
  x.addEventListener("click", () => li.remove());
  li.append(span, x);
  errorsEl.appendChild(li);
}

// ---------- Adding files ----------
async function addFiles(fileList) {
  const incoming = Array.from(fileList);
  if (!incoming.length) return;
  errorsEl.innerHTML = "";
  busy = true; render();
  setStatus(t("reading"));

  for (const file of incoming) {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) { showError(errorMessages.notPdf(file.name)); continue; }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFLib.PDFDocument.load(bytes); // throws on encrypted or broken files
      const pages = doc.getPageCount();
      if (pages === 0) { showError(errorMessages.noPages(file.name)); continue; }
      files.push({ id: nextId++, name: file.name, size: file.size, pages, bytes });
    } catch (err) {
      const isEncrypted = err && (err.name === "EncryptedPDFError" || /encrypt/i.test(String(err.message)));
      showError(isEncrypted ? errorMessages.password(file.name) : errorMessages.corrupt(file.name));
    }
  }
  busy = false; setStatus(""); render();
}

const fileInput = $("fileInput"), drop = $("drop");
fileInput.addEventListener("change", () => { addFiles(fileInput.files); fileInput.value = ""; });
["dragenter", "dragover"].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));
// Stop the browser from opening a PDF if it is dropped outside the drop zone
["dragover", "drop"].forEach((ev) => window.addEventListener(ev, (e) => e.preventDefault()));

$("clearBtn").addEventListener("click", () => { files = []; errorsEl.innerHTML = ""; setStatus(""); render(); });

// ---------- Drag to reorder (mouse + touch, via pointer events) ----------
let dragging = null;
list.addEventListener("pointerdown", (e) => {
  const handle = e.target.closest(".handle");
  if (!handle) return;
  dragging = handle.closest("li");
  dragging.classList.add("dragging");
  list.setPointerCapture(e.pointerId);
  e.preventDefault();
});
list.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const others = Array.from(list.children).filter((c) => c !== dragging);
  const next = others.find((c) => {
    const r = c.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2;
  });
  if (next !== dragging.nextElementSibling) list.insertBefore(dragging, next || null);
  // scroll the page when the finger/cursor nears the edge
  if (e.clientY < 70) window.scrollBy(0, -14);
  else if (e.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
});
function endDrag() {
  if (!dragging) return;
  dragging.classList.remove("dragging");
  dragging = null;
  const order = Array.from(list.children).map((li) => Number(li.dataset.id));
  files = order.map((id) => files.find((f) => f.id === id));
}
list.addEventListener("pointerup", endDrag);
list.addEventListener("pointercancel", endDrag);

// ---------- Merge ----------
$("mergeBtn").addEventListener("click", async () => {
  if (files.length < 2 || busy) return;
  errorsEl.innerHTML = "";
  busy = true; render();
  setStatus(t("merging"));

  let current = null;
  try {
    const out = await PDFLib.PDFDocument.create();
    for (const f of files) {
      current = f.name;
      const src = await PDFLib.PDFDocument.load(f.bytes);
      const copied = await out.copyPages(src, src.getPageIndices());
      copied.forEach((p) => out.addPage(p));
    }
    current = null;
    const bytes = await out.save();
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url; a.download = "merged.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setStatus(t("done", out.getPageCount()));
  } catch (err) {
    console.error(err);
    showError(errorMessages.mergeFailed(current));
    setStatus("");
  } finally {
    busy = false; render();
  }
});

$("langBtn").addEventListener("click", () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("mergepdf-lang", lang); } catch (e) {}
  applyLanguage();
});

applyLanguage();
