/* PDF to JPG - runs entirely in the browser (no server), uses PDF.js and JSZip */

/* ---------- Translations ---------- */
const translations = {
  bn: {
    title: 'PDF to JPG',
    subtitle: 'PDF-এর পেজ বেছে নিয়ে ছবি (JPG/PNG) বানান। সবকিছু আপনার ব্রাউজারেই হয়, কিছুই আপলোড হয় না।',
    dropTitle: 'PDF এখানে ছেড়ে দিন বা ক্লিক করে বাছাই করুন',
    dropHint: 'একবারে একটি PDF ফাইল',
    empty: 'এখনও কোনো PDF খোলা হয়নি।',
    loadingPages: 'পেজ লোড হচ্ছে… {i}/{t}',
    selected: '{n}/{t} পেজ বাছাই করা হয়েছে',
    selectAll: 'সব সিলেক্ট',
    deselectAll: 'সব বাদ দিন',
    page: 'পেজ {n}',
    quality: 'কোয়ালিটি',
    qStd: 'স্ট্যান্ডার্ড (দ্রুত)',
    qHigh: 'হাই (বড় ফাইল)',
    format: 'ফরম্যাট',
    fmtJpg: 'JPG',
    fmtPng: 'PNG',
    convert: 'ছবিতে কনভার্ট করো',
    rendering: 'পেজ কনভার্ট হচ্ছে… {i}/{t}',
    zipping: 'ZIP বানানো হচ্ছে…',
    done: 'কনভার্ট শেষ, ডাউনলোড শুরু হচ্ছে।',
    errPassword: 'এই PDF পাসওয়ার্ড দিয়ে সুরক্ষিত, তাই খোলা যাচ্ছে না। আগে পাসওয়ার্ড সরিয়ে PDF আনলক করুন, তারপর আবার চেষ্টা করুন।',
    errInvalid: 'ফাইলটি ঠিকমতো PDF নয় অথবা নষ্ট হয়ে গেছে। অন্য একটি PDF দিয়ে চেষ্টা করুন।',
    errNotPdf: 'শুধু PDF ফাইল দেওয়া যাবে।',
    errGeneric: 'কিছু একটা সমস্যা হয়েছে। কম পেজ বা স্ট্যান্ডার্ড কোয়ালিটি দিয়ে আবার চেষ্টা করুন।',
    lang: 'English'
  },
  en: {
    title: 'PDF to JPG',
    subtitle: 'Pick PDF pages and turn them into images (JPG/PNG). Everything runs in your browser; nothing is uploaded.',
    dropTitle: 'Drop a PDF here or click to choose',
    dropHint: 'One PDF file at a time',
    empty: 'No PDF opened yet.',
    loadingPages: 'Loading pages… {i}/{t}',
    selected: '{n}/{t} pages selected',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    page: 'Page {n}',
    quality: 'Quality',
    qStd: 'Standard (faster)',
    qHigh: 'High (larger files)',
    format: 'Format',
    fmtJpg: 'JPG',
    fmtPng: 'PNG',
    convert: 'Convert to images',
    rendering: 'Converting pages… {i}/{t}',
    zipping: 'Creating ZIP…',
    done: 'Conversion finished, download is starting.',
    errPassword: 'This PDF is password-protected and cannot be opened. Remove the password to unlock it, then try again.',
    errInvalid: 'This file is not a valid PDF or it is damaged. Try a different PDF.',
    errNotPdf: 'Only PDF files are supported.',
    errGeneric: 'Something went wrong. Try again with fewer pages or Standard quality.',
    lang: 'বাংলা'
  }
};

/* ---------- PDF.js setup: worker version must match the library version ---------- */
const PDFJS_VERSION = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.worker.min.js';

/* ---------- State and elements ---------- */
const $ = (id) => document.getElementById(id);
const els = {
  drop: $('drop'), file: $('file'), list: $('list'), empty: $('empty'),
  status: $('status'), bar: $('bar'), fill: $('barFill'), count: $('count'),
  toggleAll: $('toggleAll'), quality: $('quality'), format: $('format'),
  convert: $('convert'), langBtn: $('langBtn')
};
let lang = 'en';
if (!translations[lang]) lang = 'en';

let pdfDoc = null;        // current PDF.js document
let baseName = 'document';
let numPages = 0;
const selected = new Set(); // selected page numbers (1-based)
let busy = false;
let statusState = null;   // { key, vars, error } so the message can be re-translated

const THUMB_WIDTH = 240;      // thumbnail width in px
const MAX_PIXELS = 16000000;  // canvas pixel cap (mobile browsers fail above ~16.7M)
const tick = () => new Promise((r) => setTimeout(r, 0)); // let the browser breathe

/* ---------- i18n ---------- */
function t(key, vars = {}) {
  let s = translations[lang][key] || key;
  for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
  return s;
}

function setStatus(key, vars, isError) {
  statusState = key ? { key, vars, isError } : null;
  els.status.textContent = key ? t(key, vars) : '';
  els.status.classList.toggle('error', !!isError);
}

function setProgress(pct) {
  els.bar.classList.toggle('on', pct !== null);
  if (pct !== null) {
    els.fill.style.width = pct + '%';
    els.bar.setAttribute('aria-valuenow', Math.round(pct));
  }
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  els.langBtn.textContent = t('lang');
  document.querySelectorAll('.card span').forEach((s) => { s.textContent = t('page', { n: s.dataset.n }); });
  if (statusState) setStatus(statusState.key, statusState.vars, statusState.isError);
  updateSelectionUI();
}

els.langBtn.addEventListener('click', () => {
  lang = lang === 'bn' ? 'en' : 'bn';
  try { localStorage.setItem('pdf2jpg-lang', lang); } catch (e) { /* ignore */ }
  applyLang();
});

/* ---------- Rendering one page ---------- */
// scaleOrFn: a number, or a function (baseViewport) => scale. Returns a canvas.
async function renderCanvas(num, scaleOrFn) {
  const page = await pdfDoc.getPage(num);
  try {
    const scale = typeof scaleOrFn === 'function' ? scaleOrFn(page.getViewport({ scale: 1 })) : scaleOrFn;
    let vp = page.getViewport({ scale });
    const px = vp.width * vp.height;
    if (px > MAX_PIXELS) vp = page.getViewport({ scale: scale * Math.sqrt(MAX_PIXELS / px) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // white background (needed for JPG, which has no transparency)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    return canvas;
  } finally {
    page.cleanup(); // free PDF.js page resources
  }
}

// Render a page to a Blob and release the canvas memory immediately
async function renderToBlob(num, scale, mime) {
  const canvas = await renderCanvas(num, scale);
  const blob = await new Promise((res) => canvas.toBlob(res, mime, 0.92));
  canvas.width = canvas.height = 0;
  return blob;
}

/* ---------- Loading a PDF ---------- */
async function loadPdf(file) {
  if (busy) return;
  if (!file || (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name))) {
    setStatus('errNotPdf', null, true);
    return;
  }
  busy = true;
  updateButtons();
  resetDocument();
  setStatus(null);

  try {
    const data = new Uint8Array(await file.arrayBuffer());
    pdfDoc = await pdfjsLib.getDocument({ data }).promise;
    numPages = pdfDoc.numPages;
    baseName = file.name.replace(/\.pdf$/i, '') || 'document';

    // Create all cards first (selected by default), then fill thumbnails one by one
    for (let n = 1; n <= numPages; n++) { selected.add(n); els.list.appendChild(buildCard(n)); }
    els.empty.style.display = 'none';
    updateSelectionUI();

    for (let n = 1; n <= numPages; n++) {
      setStatus('loadingPages', { i: n, t: numPages });
      setProgress(((n - 1) / numPages) * 100);
      const canvas = await renderCanvas(n, (vp) => THUMB_WIDTH / vp.width);
      els.list.children[n - 1].querySelector('img').src = canvas.toDataURL('image/jpeg', 0.7);
      canvas.width = canvas.height = 0; // free canvas memory
      await tick();
    }
    setStatus(null);
  } catch (e) {
    console.error(e);
    resetDocument();
    const name = e && e.name;
    setStatus(name === 'PasswordException' ? 'errPassword'
      : name === 'InvalidPDFException' || name === 'MissingPDFException' ? 'errInvalid'
      : 'errGeneric', null, true);
  } finally {
    setProgress(null);
    busy = false;
    updateButtons();
  }
}

function resetDocument() {
  if (pdfDoc) { pdfDoc.destroy(); pdfDoc = null; }
  numPages = 0;
  selected.clear();
  els.list.innerHTML = '';
  els.empty.style.display = '';
  updateSelectionUI();
}

/* ---------- Cards and selection ---------- */
function buildCard(n) {
  const li = document.createElement('li');
  const label = document.createElement('label');
  label.className = 'card sel';
  label.innerHTML = '<input type="checkbox" checked><div class="thumb"><img alt=""></div><span></span>';
  label.querySelector('span').dataset.n = n;
  label.querySelector('span').textContent = t('page', { n });
  label.querySelector('input').addEventListener('change', (e) => {
    if (e.target.checked) selected.add(n); else selected.delete(n);
    label.classList.toggle('sel', e.target.checked);
    updateSelectionUI();
  });
  li.appendChild(label);
  return li;
}

function updateSelectionUI() {
  els.count.textContent = numPages ? t('selected', { n: selected.size, t: numPages }) : '';
  els.toggleAll.textContent = t(selected.size === numPages ? 'deselectAll' : 'selectAll');
  updateButtons();
}

function updateButtons() {
  els.toggleAll.disabled = busy || !numPages;
  els.convert.disabled = busy || !selected.size;
}

els.toggleAll.addEventListener('click', () => {
  const selectAll = selected.size !== numPages;
  els.list.querySelectorAll('input').forEach((box, i) => {
    box.checked = selectAll;
    box.closest('.card').classList.toggle('sel', selectAll);
    if (selectAll) selected.add(i + 1); else selected.delete(i + 1);
  });
  updateSelectionUI();
});

/* ---------- Upload: picker and drag & drop ---------- */
els.file.addEventListener('change', () => {
  const f = els.file.files[0];
  els.file.value = '';
  loadPdf(f);
});
['dragenter', 'dragover'].forEach((ev) => els.drop.addEventListener(ev, (e) => {
  e.preventDefault(); els.drop.classList.add('over');
}));
['dragleave', 'drop'].forEach((ev) => els.drop.addEventListener(ev, (e) => {
  e.preventDefault(); els.drop.classList.remove('over');
}));
els.drop.addEventListener('drop', (e) => loadPdf(e.dataTransfer.files[0]));
// Stop the browser from opening a file dropped outside the drop zone
['dragover', 'drop'].forEach((ev) => window.addEventListener(ev, (e) => e.preventDefault()));

/* ---------- Convert and download ---------- */
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

els.convert.addEventListener('click', async () => {
  if (busy || !selected.size) return;
  busy = true;
  updateButtons();
  try {
    const pages = Array.from(selected).sort((a, b) => a - b);
    const scale = parseFloat(els.quality.value);
    const ext = els.format.value;
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    const pad = String(numPages).length;
    const nameOf = (n) => baseName + '-page-' + String(n).padStart(pad, '0') + '.' + ext;
    const zip = pages.length > 1 ? new JSZip() : null;
    let single = null;

    // One page at a time: render, encode, store, then free the canvas
    for (let i = 0; i < pages.length; i++) {
      setStatus('rendering', { i: i + 1, t: pages.length });
      setProgress((i / pages.length) * 90);
      const blob = await renderToBlob(pages[i], scale, mime);
      if (zip) zip.file(nameOf(pages[i]), blob, { compression: 'STORE' }); // images are already compressed
      else single = { blob, name: nameOf(pages[i]) };
      await tick();
    }

    if (zip) {
      setStatus('zipping');
      const out = await zip.generateAsync({ type: 'blob' }, (m) => setProgress(90 + m.percent / 10));
      download(out, baseName + '-images.zip');
    } else {
      download(single.blob, single.name);
    }
    setProgress(100);
    setStatus('done');
  } catch (e) {
    console.error(e);
    setStatus('errGeneric', null, true);
  } finally {
    setTimeout(() => setProgress(null), 600);
    busy = false;
    updateButtons();
  }
});

/* ---------- Init ---------- */
applyLang();
