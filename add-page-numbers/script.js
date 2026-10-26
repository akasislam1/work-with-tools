'use strict';

/* ==========================================================================
   Translations: every UI string lives here (bn and en).
   Placeholders like {page} are filled in by t(key, vars).
   ========================================================================== */
const translations = {
  bn: {
    title: 'পেজ নম্বর যোগ করুন',
    subtitle: 'PDF-এর পেজে নম্বর বসান, তারপর নতুন PDF নামান। সব কাজ আপনার ব্রাউজারেই হয়, ফাইল কোথাও আপলোড হয় না।',
    dropTitle: 'PDF এখানে ছেড়ে দিন',
    dropHint: 'অথবা কম্পিউটার থেকে ফাইল বেছে নিন',
    chooseFile: 'PDF বেছে নিন',
    privacyNote: 'আপনার ফাইল ডিভাইসের বাইরে যায় না।',
    newFile: 'অন্য ফাইল',
    download: 'ডাউনলোড',
    position: 'নম্বরের পজিশন',
    posTopLeft: 'ওপরে বামে',
    posTopCenter: 'ওপরে মাঝে',
    posTopRight: 'ওপরে ডানে',
    posBottomLeft: 'নিচে বামে',
    posBottomCenter: 'নিচে মাঝে',
    posBottomRight: 'নিচে ডানে',
    format: 'ফরম্যাট',
    startNumber: 'শুরুর নম্বর',
    startPage: 'যে পেজ থেকে নম্বর শুরু',
    startPageHint: 'এর আগের পেজগুলোতে নম্বর বসবে না (যেমন কভার পেজ)।',
    fontSize: 'ফন্ট সাইজ',
    color: 'রঙ',
    previewPage: 'পেজ {page}-এর প্রিভিউ',
    summary: 'মোট {total}টির মধ্যে {count}টি পেজে নম্বর বসবে।',
    pages: 'পেজ',
    ready: 'সেটিং ঠিক করে "ডাউনলোড" চাপুন।',
    processing: 'PDF তৈরি হচ্ছে...',
    errorNotPdf: 'এটি PDF ফাইল নয়। দয়া করে একটি .pdf ফাইল দিন।',
    errorLoad: 'PDF খোলা যায়নি। ফাইলটি নষ্ট বা পাসওয়ার্ড দিয়ে সুরক্ষিত হতে পারে।',
    errorSave: 'PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।',
    langToggle: 'English'
  },
  en: {
    title: 'Add Page Numbers',
    subtitle: 'Stamp page numbers on your PDF and download a new copy. Everything runs in your browser, nothing is uploaded.',
    dropTitle: 'Drop your PDF here',
    dropHint: 'or choose a file from your computer',
    chooseFile: 'Choose PDF',
    privacyNote: 'Your file never leaves your device.',
    newFile: 'Choose another file',
    download: 'Download',
    position: 'Number position',
    posTopLeft: 'Top left',
    posTopCenter: 'Top center',
    posTopRight: 'Top right',
    posBottomLeft: 'Bottom left',
    posBottomCenter: 'Bottom center',
    posBottomRight: 'Bottom right',
    format: 'Format',
    startNumber: 'Starting number',
    startPage: 'Start numbering from page',
    startPageHint: 'Pages before this one get no number (for example, a cover page).',
    fontSize: 'Font size',
    color: 'Color',
    previewPage: 'Preview of page {page}',
    summary: '{count} of {total} pages will be numbered.',
    pages: 'pages',
    ready: 'Adjust the settings, then press Download.',
    processing: 'Building your PDF...',
    errorNotPdf: 'This is not a PDF. Please choose a .pdf file.',
    errorLoad: 'Could not open this PDF. It may be damaged or password protected.',
    errorSave: 'Could not build the PDF. Please try again.',
    langToggle: 'বাংলা'
  }
};

let currentLang = 'en';

/** Returns the translated string, replacing {name} placeholders with vars. */
function t(key, vars) {
  let text = (translations[currentLang] && translations[currentLang][key]) || key;
  if (vars) Object.keys(vars).forEach((name) => { text = text.split('{' + name + '}').join(vars[name]); });
  return text;
}

/** Applies translations to every element with a data-i18n attribute. */
function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.getElementById('langToggle').textContent = t('langToggle');
}

/* ==========================================================================
   Reusable helpers (same as the other PDF tools)
   ========================================================================== */

/**
 * Wires up a drag-and-drop zone plus a hidden file input.
 * Calls onFile(file) with the first valid file.
 */
function setupFileUpload({ dropzone, input, browseButton, accept = 'application/pdf', onFile, onInvalid }) {
  const isAccepted = (file) =>
    file.type === accept || (accept === 'application/pdf' && /\.pdf$/i.test(file.name));

  const handleFiles = (files) => {
    const file = files && files[0];
    if (!file) return;
    if (!isAccepted(file)) { if (onInvalid) onInvalid(file); return; }
    onFile(file);
  };

  const openPicker = () => input.click();

  browseButton.addEventListener('click', (e) => { e.stopPropagation(); openPicker(); });
  dropzone.addEventListener('click', openPicker);
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); }
  });
  input.addEventListener('change', () => { handleFiles(input.files); input.value = ''; });

  ['dragenter', 'dragover'].forEach((type) =>
    dropzone.addEventListener(type, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach((type) =>
    dropzone.addEventListener(type, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
}

/** Reads a File into a Uint8Array. */
async function readFileAsBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * Renders one page of a PDF.js document into a canvas (as the viewer shows it,
 * so the page's /Rotate is already applied). Returns the canvas, the visual page
 * size in PDF points, and the CSS pixels per point.
 */
async function renderPageToCanvas({ pdfDoc, pageNumber, maxSize = 150 }) {
  const dpr = window.devicePixelRatio || 1;
  const page = await pdfDoc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const cssScale = maxSize / Math.max(base.width, base.height);
  const viewport = page.getViewport({ scale: cssScale * dpr });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = Math.floor(viewport.width / dpr) + 'px';
  canvas.style.height = Math.floor(viewport.height / dpr) + 'px';

  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  page.cleanup();
  return { canvas, pageWidth: base.width, pageHeight: base.height, cssScale };
}

/** Triggers a browser download for the given bytes. */
function downloadBytes(bytes, filename, mimeType = 'application/pdf') {
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ==========================================================================
   Page number helpers (shared by the live preview and the PDF export)
   ========================================================================== */

const POSITIONS = [
  { id: 'top-left', key: 'posTopLeft' },
  { id: 'top-center', key: 'posTopCenter' },
  { id: 'top-right', key: 'posTopRight' },
  { id: 'bottom-left', key: 'posBottomLeft' },
  { id: 'bottom-center', key: 'posBottomCenter' },
  { id: 'bottom-right', key: 'posBottomRight' }
];
const FORMAT_IDS = ['n', 'page', 'slash', 'pageOf'];

const MARGIN = 36;          // distance from the page edge in points (0.5 inch)
const ASCENT = 0.72;        // Helvetica cap height as a fraction of the font size
const BASELINE_GAP = 0.15;  // space below the baseline inside a line-height:1 CSS box

/** Builds the stamped text, e.g. "Page 3 of 10". Always Latin text (Helvetica). */
function formatPageLabel(formatId, number, total) {
  switch (formatId) {
    case 'page': return 'Page ' + number;
    case 'slash': return number + ' / ' + total;
    case 'pageOf': return 'Page ' + number + ' of ' + total;
    default: return String(number);
  }
}

/** Parses an integer and clamps it into [min, max]; returns fallback for empty or invalid text. */
function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** "#rrggbb" to [r, g, b] with values from 0 to 1. */
function hexToRgb01(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Normalizes a /Rotate value to 0, 90, 180 or 270. */
function normalizeRotation(angle) {
  return (((Math.round(angle / 90) * 90) % 360) + 360) % 360;
}

/**
 * Where the text starts (left end of the baseline) on the VISIBLE page,
 * measured from its bottom-left corner in points.
 */
function computeTextPlacement({ position, pageWidth, pageHeight, textWidth, fontSize }) {
  const [row, col] = position.split('-');
  let x;
  if (col === 'left') x = MARGIN;
  else if (col === 'center') x = (pageWidth - textWidth) / 2;
  else x = pageWidth - MARGIN - textWidth;
  const y = row === 'top' ? pageHeight - MARGIN - ASCENT * fontSize : MARGIN;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

/**
 * Converts a point on the visible (rotated) page into the page's own coordinate
 * space, which is what pdf-lib draws in. Also returns the text rotation needed
 * so the number reads upright on screen.
 * The page is displayed rotated clockwise by `rotation`; we undo that here.
 */
function visualToPageSpace(point, rotation, box) {
  const { x: vx, y: vy } = point;
  let ux;
  let uy;
  switch (rotation) {
    case 90:  ux = box.width - vy; uy = vx; break;
    case 180: ux = box.width - vx; uy = box.height - vy; break;
    case 270: ux = vy; uy = box.height - vx; break;
    default:  ux = vx; uy = vy;
  }
  return { x: box.x + ux, y: box.y + uy, angle: rotation };
}

/** Last number used, shown as the "total" in formats like "1 / 10". */
function getLastNumber(startNumber, startPage, totalPages) {
  return startNumber + (totalPages - startPage + 1) - 1;
}

/**
 * Stamps page numbers with pdf-lib and returns the new bytes.
 * Page content is untouched (nothing is re-rendered), so size and quality stay the same.
 * Rotated pages and CropBoxes are handled by mapping the position into page space.
 */
async function buildNumberedPdf(originalBytes, s) {
  const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const firstIndex = s.startPage - 1;
  const lastNumber = getLastNumber(s.startNumber, s.startPage, pages.length);
  const color = rgb(s.color[0], s.color[1], s.color[2]);

  pages.forEach((page, i) => {
    if (i < firstIndex) return; // skipped pages (for example the cover)
    const text = formatPageLabel(s.format, s.startNumber + (i - firstIndex), lastNumber);
    const box = page.getCropBox(); // the visible area (falls back to the MediaBox)
    const rotation = normalizeRotation(page.getRotation().angle);
    const swapped = rotation === 90 || rotation === 270;

    const anchor = computeTextPlacement({
      position: s.position,
      pageWidth: swapped ? box.height : box.width,
      pageHeight: swapped ? box.width : box.height,
      textWidth: font.widthOfTextAtSize(text, s.fontSize),
      fontSize: s.fontSize
    });
    const p = visualToPageSpace(anchor, rotation, box);
    page.drawText(text, { x: p.x, y: p.y, size: s.fontSize, font, color, rotate: degrees(p.angle) });
  });
  return pdfDoc.save();
}

/* ==========================================================================
   Add Page Numbers tool
   ========================================================================== */

// pdf.js worker (pinned to the same version as the script tag)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const els = {
  uploadView: document.getElementById('uploadView'),
  editorView: document.getElementById('editorView'),
  dropzone: document.getElementById('dropzone'),
  fileInput: document.getElementById('fileInput'),
  chooseBtn: document.getElementById('chooseBtn'),
  fileName: document.getElementById('fileName'),
  fileMeta: document.getElementById('fileMeta'),
  status: document.getElementById('status'),
  errorBox: document.getElementById('errorBox'),
  posPicker: document.getElementById('posPicker'),
  format: document.getElementById('format'),
  startNumber: document.getElementById('startNumber'),
  startPage: document.getElementById('startPage'),
  fontSize: document.getElementById('fontSize'),
  color: document.getElementById('color'),
  summary: document.getElementById('summary'),
  previewTitle: document.getElementById('previewTitle'),
  previewPaper: document.getElementById('previewPaper'),
  stamp: document.getElementById('stamp'),
  newFileBtn: document.getElementById('newFileBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  langToggle: document.getElementById('langToggle')
};

const state = {
  fileName: '',
  originalBytes: null, // untouched bytes, used by pdf-lib on export
  pdfDoc: null,        // PDF.js document, used only for the preview
  total: 0,
  position: 'bottom-center',
  preview: null,       // { pageWidth, pageHeight, cssScale } of the rendered preview page
  previewIndex: -1,    // zero-based page currently shown in the preview
  previewToken: 0,     // cancels outdated preview renders
  busy: false,
  loadToken: 0         // lets us cancel an older load when a new file is chosen
};

// A Helvetica font used only to measure text width, so the preview matches the export
const measureFontPromise = (async () => {
  const doc = await PDFLib.PDFDocument.create();
  return doc.embedFont(PDFLib.StandardFonts.Helvetica);
})();

function showError(key) {
  els.errorBox.textContent = t(key);
  els.errorBox.classList.remove('hidden');
}
function clearError() { els.errorBox.classList.add('hidden'); }

/** Reads and sanitizes every setting from the form. */
function readSettings() {
  return {
    position: state.position,
    format: els.format.value,
    startNumber: clampInt(els.startNumber.value, 0, 99999, 1),
    startPage: clampInt(els.startPage.value, 1, Math.max(1, state.total), 1),
    fontSize: clampInt(els.fontSize.value, 6, 72, 12),
    colorHex: els.color.value,
    color: hexToRgb01(els.color.value)
  };
}

/** Builds the six position buttons (also used to refresh labels after a language change). */
function renderPositionPicker() {
  els.posPicker.replaceChildren();
  POSITIONS.forEach((pos) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pos-btn ' + pos.id.split('-')[0];
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(pos.id === state.position));
    btn.setAttribute('aria-label', t(pos.key));
    btn.title = t(pos.key);
    btn.addEventListener('click', () => { state.position = pos.id; renderPositionPicker(); refreshPreview(); });
    els.posPicker.appendChild(btn);
  });
}

/** Fills the format dropdown with live examples such as "Page 1 of 10". */
function renderFormatOptions() {
  FORMAT_IDS.forEach((id) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = formatPageLabel(id, 1, 10);
    els.format.appendChild(option);
  });
}

/** Places the sample number on the preview exactly where the export will draw it. */
async function positionStamp() {
  if (!state.preview) return;
  const font = await measureFontPromise;
  const s = readSettings();
  const { pageWidth, pageHeight, cssScale } = state.preview;
  const text = formatPageLabel(s.format, s.startNumber, getLastNumber(s.startNumber, s.startPage, state.total));
  const anchor = computeTextPlacement({
    position: s.position, pageWidth, pageHeight,
    textWidth: font.widthOfTextAtSize(text, s.fontSize), fontSize: s.fontSize
  });

  els.stamp.textContent = text;
  els.stamp.style.fontSize = s.fontSize * cssScale + 'px';
  els.stamp.style.color = s.colorHex;
  els.stamp.style.left = anchor.x * cssScale + 'px';
  els.stamp.style.bottom = (anchor.y - BASELINE_GAP * s.fontSize) * cssScale + 'px';
  els.stamp.classList.remove('hidden');
}

/** Updates the summary and preview; re-renders the page only when the start page changes. */
async function refreshPreview() {
  if (!state.pdfDoc) return;
  const s = readSettings();
  els.summary.textContent = t('summary', { count: state.total - s.startPage + 1, total: state.total });
  els.previewTitle.textContent = t('previewPage', { page: s.startPage });

  if (state.previewIndex !== s.startPage - 1) {
    state.previewIndex = s.startPage - 1;
    state.preview = null;
    els.stamp.classList.add('hidden');
    els.previewPaper.classList.add('loading');
    const token = ++state.previewToken;
    try {
      const result = await renderPageToCanvas({ pdfDoc: state.pdfDoc, pageNumber: s.startPage, maxSize: 400 });
      if (token !== state.previewToken) return; // a newer render took over
      els.previewPaper.querySelector('canvas')?.remove();
      els.previewPaper.prepend(result.canvas);
      els.previewPaper.classList.remove('loading');
      state.preview = { pageWidth: result.pageWidth, pageHeight: result.pageHeight, cssScale: result.cssScale };
    } catch (err) {
      console.error(err);
      return;
    }
  }
  await positionStamp();
}

/** Loads a PDF file and resets the form for it. */
async function loadPdf(file) {
  clearError();
  const token = ++state.loadToken;
  try {
    const bytes = await readFileAsBytes(file);
    // PDF.js transfers the buffer to its worker, so give it a copy
    const pdfDoc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
    if (token !== state.loadToken) return;

    if (state.pdfDoc) state.pdfDoc.destroy();
    state.fileName = file.name;
    state.originalBytes = bytes;
    state.pdfDoc = pdfDoc;
    state.total = pdfDoc.numPages;
    state.previewIndex = -1;
    state.preview = null;
    els.previewPaper.querySelector('canvas')?.remove();

    els.startNumber.value = 1;
    els.startPage.value = 1;
    els.startPage.max = state.total;
    els.fileName.textContent = file.name;
    els.fileMeta.textContent = state.total + ' ' + t('pages');
    els.status.textContent = t('ready');
    els.uploadView.classList.add('hidden');
    els.editorView.classList.remove('hidden');
    await refreshPreview();
  } catch (err) {
    console.error(err);
    if (token === state.loadToken) showError('errorLoad');
  }
}

async function handleDownload() {
  if (!state.originalBytes || state.busy) return;
  clearError();
  state.busy = true;
  els.downloadBtn.disabled = true;
  els.status.textContent = t('processing');
  try {
    const bytes = await buildNumberedPdf(state.originalBytes, readSettings());
    const baseName = state.fileName.replace(/\.pdf$/i, '');
    downloadBytes(bytes, baseName + '-numbered.pdf');
    els.status.textContent = t('ready');
  } catch (err) {
    console.error(err);
    showError('errorSave');
  } finally {
    state.busy = false;
    els.downloadBtn.disabled = false;
  }
}

function resetToUpload() {
  state.loadToken++;
  state.previewToken++;
  if (state.pdfDoc) { state.pdfDoc.destroy(); state.pdfDoc = null; }
  state.originalBytes = null;
  state.total = 0;
  state.preview = null;
  state.previewIndex = -1;
  els.previewPaper.querySelector('canvas')?.remove();
  els.editorView.classList.add('hidden');
  els.uploadView.classList.remove('hidden');
  clearError();
}

/* ===== Init ===== */
setupFileUpload({
  dropzone: els.dropzone,
  input: els.fileInput,
  browseButton: els.chooseBtn,
  accept: 'application/pdf',
  onFile: loadPdf,
  onInvalid: () => showError('errorNotPdf')
});

renderFormatOptions();
renderPositionPicker();
[els.format, els.startNumber, els.startPage, els.fontSize, els.color].forEach((control) => {
  control.addEventListener('input', refreshPreview);
  control.addEventListener('change', refreshPreview);
});
els.downloadBtn.addEventListener('click', handleDownload);
els.newFileBtn.addEventListener('click', resetToUpload);
els.langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'bn' ? 'en' : 'bn';
  try { localStorage.setItem('lang', currentLang); } catch (e) { /* ignore */ }
  applyTranslations();
  renderPositionPicker();
  if (state.pdfDoc) {
    els.fileMeta.textContent = state.total + ' ' + t('pages');
    els.status.textContent = t('ready');
    refreshPreview();
  }
});

applyTranslations();
