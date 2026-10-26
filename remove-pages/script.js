'use strict';

/* ==========================================================================
   Translations: every UI string lives here (bn and en).
   Placeholders like {total} are filled in by t(key, vars).
   ========================================================================== */
const translations = {
  bn: {
    title: 'PDF থেকে পেজ বাদ দিন',
    subtitle: 'অপ্রয়োজনীয় পেজ সিলেক্ট করে বাদ দিন, তারপর নতুন PDF নামান। সব কাজ আপনার ব্রাউজারেই হয়।',
    dropTitle: 'PDF এখানে ছেড়ে দিন',
    dropHint: 'অথবা কম্পিউটার থেকে ফাইল বেছে নিন',
    chooseFile: 'PDF বেছে নিন',
    privacyNote: 'আপনার ফাইল ডিভাইসের বাইরে যায় না।',
    clearSelection: 'সিলেকশন মুছুন',
    newFile: 'অন্য ফাইল',
    download: 'ডাউনলোড',
    rangeLabel: 'যে পেজগুলো বাদ দেবেন',
    rangePlaceholder: '1, 3, 5-8',
    rangeHint: 'কমা দিয়ে পেজ নম্বর লিখুন, আর রেঞ্জের জন্য হাইফেন ব্যবহার করুন। যেমন: 1, 3, 5-8। থাম্বনেইলে ক্লিক করেও সিলেক্ট করা যায়।',
    noneSelected: 'কোনো পেজ সিলেক্ট করা হয়নি।',
    selectedCount: 'মোট {total}টির মধ্যে {selected}টি পেজ সিলেক্ট করা হয়েছে। নতুন PDF-এ থাকবে {remaining}টি।',
    allSelectedWarning: 'সব পেজ সিলেক্ট করা হয়েছে। PDF-এ অন্তত একটি পেজ থাকতে হবে, তাই অন্তত একটি পেজের সিলেকশন বাদ দিন।',
    errorFormat: '"{token}" পড়া যায়নি। এভাবে লিখুন: 1, 3, 5-8',
    errorRange: '"{token}" সঠিক নয়। পেজ নম্বর ১ থেকে {total}-এর মধ্যে হতে হবে, আর রেঞ্জ ছোট থেকে বড় লিখুন (যেমন 5-8)।',
    page: 'পেজ',
    pages: 'পেজ',
    rendering: 'থাম্বনেইল তৈরি হচ্ছে',
    ready: 'বাদ দেওয়ার পেজ সিলেক্ট করে "ডাউনলোড" চাপুন।',
    processing: 'PDF তৈরি হচ্ছে...',
    errorNotPdf: 'এটি PDF ফাইল নয়। দয়া করে একটি .pdf ফাইল দিন।',
    errorLoad: 'PDF খোলা যায়নি। ফাইলটি নষ্ট বা পাসওয়ার্ড দিয়ে সুরক্ষিত হতে পারে।',
    errorSave: 'PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।',
    langToggle: 'English'
  },
  en: {
    title: 'Remove Pages',
    subtitle: 'Select the pages you do not need, then download a new PDF. Everything runs in your browser.',
    dropTitle: 'Drop your PDF here',
    dropHint: 'or choose a file from your computer',
    chooseFile: 'Choose PDF',
    privacyNote: 'Your file never leaves your device.',
    clearSelection: 'Clear selection',
    newFile: 'Choose another file',
    download: 'Download',
    rangeLabel: 'Pages to remove',
    rangePlaceholder: '1, 3, 5-8',
    rangeHint: 'Separate page numbers with commas and use a hyphen for ranges, like 1, 3, 5-8. You can also click the thumbnails.',
    noneSelected: 'No pages selected.',
    selectedCount: '{selected} of {total} selected. {remaining} will remain in the new PDF.',
    allSelectedWarning: 'Every page is selected. A PDF needs at least one page, so unselect at least one.',
    errorFormat: 'Could not read "{token}". Use a format like 1, 3, 5-8.',
    errorRange: '"{token}" is not valid. Use page numbers from 1 to {total}, and write ranges from low to high (like 5-8).',
    page: 'Page',
    pages: 'pages',
    rendering: 'Rendering thumbnails',
    ready: 'Select the pages to remove, then press Download.',
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
  document.getElementById('rangeInput').placeholder = t('rangePlaceholder');
  document.getElementById('langToggle').textContent = t('langToggle');
}

/* ==========================================================================
   Reusable helpers (same as the Rotate PDF tool)
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
   Page range helpers
   ========================================================================== */

/**
 * Parses text like "1, 3, 5-8" into a Set of zero-based page indices.
 * Accepts Bengali digits and typographic dashes. Returns { pages } on success
 * or { error: { key, vars } } on failure. Empty text is valid (no pages).
 */
function parsePageRanges(text, total) {
  const normalized = text
    .replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .trim();

  const pages = new Set();
  if (!normalized) return { pages };

  for (const token of normalized.split(/[,;\s]+/).filter(Boolean)) {
    const match = token.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) return { error: { key: 'errorFormat', vars: { token } } };
    const start = Number(match[1]);
    const end = match[2] === undefined ? start : Number(match[2]);
    if (start < 1 || end > total || start > end) {
      return { error: { key: 'errorRange', vars: { token, total } } };
    }
    for (let p = start; p <= end; p++) pages.add(p - 1);
  }
  return { pages };
}

/** Turns a collection of zero-based indices into text like "1, 3, 5-8". */
function formatPageRanges(indices) {
  const sorted = Array.from(indices).sort((a, b) => a - b);
  const parts = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(j > i ? (sorted[i] + 1) + '-' + (sorted[j] + 1) : String(sorted[i] + 1));
    i = j + 1;
  }
  return parts.join(', ');
}

/* ==========================================================================
   Remove Pages tool
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
  rangeInput: document.getElementById('rangeInput'),
  rangeError: document.getElementById('rangeError'),
  count: document.getElementById('count'),
  allWarning: document.getElementById('allWarning'),
  clearBtn: document.getElementById('clearBtn'),
  newFileBtn: document.getElementById('newFileBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  langToggle: document.getElementById('langToggle')
};

const state = {
  fileName: '',
  originalBytes: null,   // untouched bytes, used by pdf-lib on export
  pdfDoc: null,          // PDF.js document, used only for thumbnails
  total: 0,              // number of pages in the loaded PDF
  selected: new Set(),   // zero-based indices of pages to remove
  cards: [],             // thumbnail card elements, by page index
  rangeError: null,      // { key, vars } while the input text is invalid
  busy: false,           // true while the output PDF is being built
  loadToken: 0           // lets us cancel an older render when a new file is loaded
};

function showError(key) {
  els.errorBox.textContent = t(key);
  els.errorBox.classList.remove('hidden');
}
function clearError() { els.errorBox.classList.add('hidden'); }

/** Refreshes the count, warning, range error and button states from state. */
function updateSummary() {
  const count = state.selected.size;
  const allSelected = state.total > 0 && count === state.total;

  els.count.textContent = count === 0
    ? t('noneSelected')
    : t('selectedCount', { selected: count, total: state.total, remaining: state.total - count });

  els.allWarning.classList.toggle('hidden', !allSelected);
  // Download is blocked when nothing is selected or when every page is selected
  els.downloadBtn.disabled = state.busy || count === 0 || allSelected;
  els.clearBtn.disabled = count === 0;

  if (state.rangeError) {
    els.rangeError.textContent = t(state.rangeError.key, state.rangeError.vars);
    els.rangeError.classList.remove('hidden');
    els.rangeInput.setAttribute('aria-invalid', 'true');
  } else {
    els.rangeError.classList.add('hidden');
    els.rangeInput.removeAttribute('aria-invalid');
  }
}

/** Replaces the selection and updates every card plus the summary. */
function setSelection(indices) {
  state.selected = new Set(indices);
  state.cards.forEach((card, i) => {
    const isSelected = state.selected.has(i);
    card.classList.toggle('selected', isSelected);
    card.setAttribute('aria-pressed', String(isSelected));
  });
  updateSummary();
}

/** Toggles one page from a thumbnail click and mirrors it into the input. */
function togglePage(index) {
  const next = new Set(state.selected);
  if (next.has(index)) next.delete(index); else next.add(index);
  state.rangeError = null;
  setSelection(next);
  els.rangeInput.value = formatPageRanges(next);
}

/** Typing in the box selects matching thumbnails. Invalid text keeps the old selection. */
function handleRangeInput() {
  const result = parsePageRanges(els.rangeInput.value, state.total);
  if (result.error) {
    state.rangeError = result.error;
    updateSummary();
    return;
  }
  state.rangeError = null;
  setSelection(result.pages);
}

function clearSelection() {
  state.rangeError = null;
  els.rangeInput.value = '';
  setSelection([]);
}

/** Builds one clickable thumbnail card with a red cross overlay. */
function createPageCell(index) {
  const cell = document.createElement('div');
  cell.className = 'card';
  cell.tabIndex = 0;
  cell.setAttribute('role', 'button');
  cell.setAttribute('aria-pressed', 'false');
  cell.setAttribute('aria-label', t('page') + ' ' + (index + 1));

  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  const paper = document.createElement('div');
  paper.className = 'paper loading';
  const cross = document.createElement('div');
  cross.className = 'cross';
  cross.setAttribute('aria-hidden', 'true');
  cross.textContent = '✕';
  thumb.append(paper, cross);

  const label = document.createElement('div');
  label.className = 'page-label';
  label.textContent = t('page') + ' ' + (index + 1);

  cell.append(thumb, label);
  cell.addEventListener('click', () => togglePage(index));
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePage(index); }
  });

  state.cards[index] = cell;
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
    state.total = pdfDoc.numPages;
    state.selected = new Set();
    state.cards = [];
    state.rangeError = null;

    els.fileName.textContent = file.name;
    els.fileMeta.textContent = pdfDoc.numPages + ' ' + t('pages');
    els.rangeInput.value = '';
    els.grid.replaceChildren();
    els.uploadView.classList.add('hidden');
    els.editorView.classList.remove('hidden');
    updateSummary();

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
 * Builds a new PDF that contains every page except the removed ones.
 * Pages are copied as they are (no re-rendering), so size and quality stay identical.
 * Copying into a fresh document also drops the removed pages' data from the file.
 */
async function buildPdfWithoutPages(originalBytes, removedIndices) {
  const { PDFDocument } = PDFLib;
  const source = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const keepIndices = source.getPageIndices().filter((i) => !removedIndices.has(i));
  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(source, keepIndices);
  copiedPages.forEach((page) => output.addPage(page));
  return output.save();
}

async function handleDownload() {
  if (!state.originalBytes || state.busy) return;
  // Safety net: never build a PDF with zero pages
  if (state.selected.size === 0 || state.selected.size === state.total) return;

  clearError();
  state.busy = true;
  updateSummary();
  els.status.textContent = t('processing');
  try {
    const bytes = await buildPdfWithoutPages(state.originalBytes, state.selected);
    const baseName = state.fileName.replace(/\.pdf$/i, '');
    downloadBytes(bytes, baseName + '-pages-removed.pdf');
    els.status.textContent = t('ready');
  } catch (err) {
    console.error(err);
    showError('errorSave');
  } finally {
    state.busy = false;
    updateSummary();
  }
}

function resetToUpload() {
  state.loadToken++; // cancels any render in progress
  if (state.pdfDoc) { state.pdfDoc.destroy(); state.pdfDoc = null; }
  state.originalBytes = null;
  state.total = 0;
  state.selected = new Set();
  state.cards = [];
  state.rangeError = null;
  els.rangeInput.value = '';
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

els.rangeInput.addEventListener('input', handleRangeInput);
els.clearBtn.addEventListener('click', clearSelection);
els.downloadBtn.addEventListener('click', handleDownload);
els.newFileBtn.addEventListener('click', resetToUpload);
els.langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'bn' ? 'en' : 'bn';
  try { localStorage.setItem('lang', currentLang); } catch (e) { /* ignore */ }
  applyTranslations();
  // Refresh strings that were generated dynamically
  if (state.pdfDoc) {
    els.fileMeta.textContent = state.total + ' ' + t('pages');
    els.status.textContent = t('ready');
    els.grid.querySelectorAll('.card').forEach((card, i) => {
      const text = t('page') + ' ' + (i + 1);
      card.querySelector('.page-label').textContent = text;
      card.setAttribute('aria-label', text);
    });
    updateSummary();
  }
});

applyTranslations();
updateSummary();
