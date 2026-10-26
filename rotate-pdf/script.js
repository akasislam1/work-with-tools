'use strict';

/* ==========================================================================
   Translations: every UI string lives here (bn and en)
   ========================================================================== */
const translations = {
  bn: {
    title: 'PDF ঘোরান',
    subtitle: 'পেজ ঘুরিয়ে নতুন PDF নামান। সব কাজ আপনার ব্রাউজারেই হয়, ফাইল কোথাও আপলোড হয় না।',
    dropTitle: 'PDF এখানে ছেড়ে দিন',
    dropHint: 'অথবা কম্পিউটার থেকে ফাইল বেছে নিন',
    chooseFile: 'PDF বেছে নিন',
    privacyNote: 'আপনার ফাইল ডিভাইসের বাইরে যায় না।',
    rotateAll: 'সব পেজ ঘোরাও',
    newFile: 'অন্য ফাইল',
    download: 'ডাউনলোড',
    rotateLeft: 'বামে ৯০° ঘোরান',
    rotateRight: 'ডানে ৯০° ঘোরান',
    page: 'পেজ',
    pages: 'পেজ',
    rendering: 'থাম্বনেইল তৈরি হচ্ছে',
    ready: 'পেজ ঘুরিয়ে "ডাউনলোড" চাপুন।',
    processing: 'PDF তৈরি হচ্ছে...',
    errorNotPdf: 'এটি PDF ফাইল নয়। দয়া করে একটি .pdf ফাইল দিন।',
    errorLoad: 'PDF খোলা যায়নি। ফাইলটি নষ্ট বা পাসওয়ার্ড দিয়ে সুরক্ষিত হতে পারে।',
    errorSave: 'PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।',
    langToggle: 'English'
  },
  en: {
    title: 'Rotate PDF',
    subtitle: 'Rotate pages and download a new PDF. Everything runs in your browser, nothing is uploaded.',
    dropTitle: 'Drop your PDF here',
    dropHint: 'or choose a file from your computer',
    chooseFile: 'Choose PDF',
    privacyNote: 'Your file never leaves your device.',
    rotateAll: 'Rotate all pages',
    newFile: 'Choose another file',
    download: 'Download',
    rotateLeft: 'Rotate left 90°',
    rotateRight: 'Rotate right 90°',
    page: 'Page',
    pages: 'pages',
    rendering: 'Rendering thumbnails',
    ready: 'Rotate pages, then press Download.',
    processing: 'Building your PDF...',
    errorNotPdf: 'This is not a PDF. Please choose a .pdf file.',
    errorLoad: 'Could not open this PDF. It may be damaged or password protected.',
    errorSave: 'Could not build the PDF. Please try again.',
    langToggle: 'বাংলা'
  }
};

let currentLang = 'en';

/** Returns the translated string for the current language. */
function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || key;
}

/** Applies translations to every element with a data-i18n attribute. */
function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.getElementById('langToggle').textContent = t('langToggle');
}

/* ==========================================================================
   Reusable helpers (copy these into other tools)
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
 * Renders every page of a PDF.js document as a thumbnail canvas.
 * createCell(pageIndex) must return { cell, host }: the cell is appended to the
 * container, and the canvas is placed inside host once the page is rendered.
 * Returns the number of rendered pages (stops early if isCancelled() is true).
 */
async function renderPdfThumbnails({ pdfDoc, container, maxSize = 150, createCell, onProgress, isCancelled = () => false }) {
  const dpr = window.devicePixelRatio || 1;
  const hosts = [];

  // Create all cells first so the grid layout appears immediately
  for (let i = 0; i < pdfDoc.numPages; i++) {
    const { cell, host } = createCell(i);
    container.appendChild(cell);
    hosts.push(host);
  }

  for (let i = 0; i < pdfDoc.numPages; i++) {
    if (isCancelled()) return i;
    const page = await pdfDoc.getPage(i + 1);
    const base = page.getViewport({ scale: 1 });
    const cssScale = maxSize / Math.max(base.width, base.height);
    const viewport = page.getViewport({ scale: cssScale * dpr });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = Math.floor(viewport.width / dpr) + 'px';
    canvas.style.height = Math.floor(viewport.height / dpr) + 'px';

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    if (isCancelled()) return i;

    hosts[i].classList.remove('loading');
    hosts[i].replaceChildren(canvas);
    page.cleanup();
    if (onProgress) onProgress(i + 1, pdfDoc.numPages);
  }
  return pdfDoc.numPages;
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
   Rotate PDF tool
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
  grid: document.getElementById('grid'),
  fileName: document.getElementById('fileName'),
  fileMeta: document.getElementById('fileMeta'),
  status: document.getElementById('status'),
  errorBox: document.getElementById('errorBox'),
  rotateAllBtn: document.getElementById('rotateAllBtn'),
  newFileBtn: document.getElementById('newFileBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  langToggle: document.getElementById('langToggle')
};

const state = {
  fileName: '',
  originalBytes: null, // untouched bytes, used by pdf-lib on export
  pdfDoc: null,        // PDF.js document, used only for thumbnails
  rotations: [],       // cumulative rotation in degrees per page (may be negative)
  papers: [],          // DOM elements that get the CSS rotation preview
  loadToken: 0         // lets us cancel an older render when a new file is loaded
};

function showError(key) {
  els.errorBox.textContent = t(key);
  els.errorBox.classList.remove('hidden');
}
function clearError() { els.errorBox.classList.add('hidden'); }

/** Applies the stored rotation of one page to its thumbnail. */
function updatePreview(index) {
  state.papers[index].style.transform = 'rotate(' + state.rotations[index] + 'deg)';
}

function rotatePage(index, delta) {
  state.rotations[index] += delta;
  updatePreview(index);
}

function rotateAll(delta) {
  state.rotations = state.rotations.map((r) => r + delta);
  state.rotations.forEach((_, i) => updatePreview(i));
}

/** Builds one thumbnail card with left/right rotate buttons. */
function createPageCell(index) {
  const cell = document.createElement('div');
  cell.className = 'card';

  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  const paper = document.createElement('div');
  paper.className = 'paper loading';
  thumb.appendChild(paper);

  const label = document.createElement('div');
  label.className = 'page-label';
  label.textContent = t('page') + ' ' + (index + 1);

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const makeButton = (symbol, labelKey, delta) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn icon-btn';
    btn.textContent = symbol;
    btn.title = t(labelKey);
    btn.setAttribute('aria-label', t(labelKey) + ' (' + t('page') + ' ' + (index + 1) + ')');
    btn.addEventListener('click', () => rotatePage(index, delta));
    return btn;
  };
  actions.append(makeButton('↶', 'rotateLeft', -90), makeButton('↷', 'rotateRight', 90));

  cell.append(thumb, label, actions);
  state.papers[index] = paper;
  return { cell, host: paper };
}

/** Loads a PDF file, resets state and renders thumbnails. */
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
    state.rotations = new Array(pdfDoc.numPages).fill(0);
    state.papers = [];

    els.fileName.textContent = file.name;
    els.fileMeta.textContent = pdfDoc.numPages + ' ' + t('pages');
    els.grid.replaceChildren();
    els.uploadView.classList.add('hidden');
    els.editorView.classList.remove('hidden');

    await renderPdfThumbnails({
      pdfDoc,
      container: els.grid,
      createCell: createPageCell,
      isCancelled: () => token !== state.loadToken,
      onProgress: (done, total) => {
        els.status.textContent = done < total ? t('rendering') + ' ' + done + '/' + total : t('ready');
      }
    });
  } catch (err) {
    console.error(err);
    if (token === state.loadToken) showError('errorLoad');
  }
}

/**
 * Applies rotations to the ORIGINAL PDF with pdf-lib and returns the new bytes.
 * Pages are never re-rendered or re-encoded, so size and quality stay identical.
 * Only the /Rotate entry of each page changes.
 */
async function buildRotatedPdf(originalBytes, rotations) {
  const { PDFDocument, degrees } = PDFLib;
  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  pdfDoc.getPages().forEach((page, i) => {
    const delta = ((rotations[i] % 360) + 360) % 360;
    if (delta === 0) return;
    const current = page.getRotation().angle; // keep any rotation the page already had
    page.setRotation(degrees((current + delta) % 360));
  });
  return pdfDoc.save();
}

async function handleDownload() {
  if (!state.originalBytes) return;
  clearError();
  els.downloadBtn.disabled = true;
  els.status.textContent = t('processing');
  try {
    const bytes = await buildRotatedPdf(state.originalBytes, state.rotations);
    const baseName = state.fileName.replace(/\.pdf$/i, '');
    downloadBytes(bytes, baseName + '-rotated.pdf');
    els.status.textContent = t('ready');
  } catch (err) {
    console.error(err);
    showError('errorSave');
  } finally {
    els.downloadBtn.disabled = false;
  }
}

function resetToUpload() {
  state.loadToken++; // cancels any render in progress
  if (state.pdfDoc) { state.pdfDoc.destroy(); state.pdfDoc = null; }
  state.originalBytes = null;
  state.rotations = [];
  state.papers = [];
  els.grid.replaceChildren();
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

els.rotateAllBtn.addEventListener('click', () => rotateAll(90));
els.downloadBtn.addEventListener('click', handleDownload);
els.newFileBtn.addEventListener('click', resetToUpload);
els.langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'bn' ? 'en' : 'bn';
  try { localStorage.setItem('lang', currentLang); } catch (e) { /* ignore */ }
  applyTranslations();
  // Refresh strings that were generated dynamically
  if (state.pdfDoc) {
    els.fileMeta.textContent = state.pdfDoc.numPages + ' ' + t('pages');
    els.status.textContent = t('ready');
    els.grid.querySelectorAll('.card').forEach((card, i) => {
      card.querySelector('.page-label').textContent = t('page') + ' ' + (i + 1);
      const [left, right] = card.querySelectorAll('.icon-btn');
      const suffix = ' (' + t('page') + ' ' + (i + 1) + ')';
      left.title = t('rotateLeft'); left.setAttribute('aria-label', t('rotateLeft') + suffix);
      right.title = t('rotateRight'); right.setAttribute('aria-label', t('rotateRight') + suffix);
    });
  }
});

applyTranslations();
