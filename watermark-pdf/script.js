'use strict';

/* ==========================================================================
   Translations: every UI string lives here (bn and en).
   Placeholders like {page} are filled in by t(key, vars).
   ========================================================================== */
const translations = {
  bn: {
    title: 'PDF-এ ওয়াটারমার্ক যোগ করুন',
    subtitle: 'লেখা বা লোগো ওয়াটারমার্ক বসান, তারপর নতুন PDF নামান। সব কাজ আপনার ব্রাউজারেই হয়, ফাইল কোথাও আপলোড হয় না।',
    dropTitle: 'PDF এখানে ছেড়ে দিন',
    dropHint: 'অথবা কম্পিউটার থেকে ফাইল বেছে নিন',
    chooseFile: 'PDF বেছে নিন',
    privacyNote: 'আপনার ফাইল ডিভাইসের বাইরে যায় না।',
    newFile: 'অন্য ফাইল',
    download: 'ডাউনলোড',
    typeText: 'লেখা',
    typeImage: 'ছবি / লোগো',
    text: 'ওয়াটারমার্কের লেখা',
    fontSize: 'ফন্ট সাইজ',
    color: 'রঙ',
    logo: 'লোগো (PNG বা JPG)',
    chooseLogo: 'ছবি বেছে নিন',
    noLogo: 'কোনো ছবি বাছা হয়নি।',
    errorLogoType: 'শুধু PNG বা JPG ছবি দিন।',
    errorLogoLoad: 'ছবিটি পড়া যায়নি।',
    size: 'সাইজ (পেজের প্রস্থের %)',
    opacity: 'স্বচ্ছতা (Opacity)',
    position: 'পজিশন',
    posTopLeft: 'ওপরে বামে',
    posTopCenter: 'ওপরে মাঝে',
    posTopRight: 'ওপরে ডানে',
    posMiddleLeft: 'মাঝখানে বামে',
    posMiddleCenter: 'ঠিক মাঝখানে',
    posMiddleRight: 'মাঝখানে ডানে',
    posBottomLeft: 'নিচে বামে',
    posBottomCenter: 'নিচে মাঝে',
    posBottomRight: 'নিচে ডানে',
    posDiagonal: 'মাঝখানে কোনাকুনি (৪৫°)',
    tile: 'পুরো পেজজুড়ে টাইল করে বসান',
    tileGap: 'টাইলের ফাঁক (%)',
    tileHint: 'টাইল করলে পজিশন শুধু ঘূর্ণন ঠিক করে: যেকোনো ঘর বাছলে সোজা টাইল হয়, "কোনাকুনি" বাছলে টাইল ৪৫° হেলে থাকে।',
    pagesLabel: 'কোন পেজে বসবে',
    pagesAll: 'সব পেজ',
    pagesSpecific: 'নির্দিষ্ট পেজ',
    pagesHint: 'যেমন: 1-3, 5। কমা দিয়ে পেজ নম্বর লিখুন, রেঞ্জের জন্য হাইফেন ব্যবহার করুন।',
    errorFormat: '"{token}" পড়া যায়নি। এভাবে লিখুন: 1-3, 5',
    errorRange: '"{token}" সঠিক নয়। পেজ নম্বর ১ থেকে {total}-এর মধ্যে হতে হবে, আর রেঞ্জ ছোট থেকে বড় লিখুন (যেমন 1-3)।',
    summary: 'মোট {total}টির মধ্যে {count}টি পেজে ওয়াটারমার্ক বসবে।',
    previewPage: 'পেজ {page}-এর প্রিভিউ',
    pagesUnit: 'পেজ',
    needWatermark: 'লেখা লিখুন অথবা ছবি বেছে নিন।',
    ready: 'সেটিং ঠিক করে "ডাউনলোড" চাপুন।',
    processing: 'PDF তৈরি হচ্ছে...',
    errorNotPdf: 'এটি PDF ফাইল নয়। দয়া করে একটি .pdf ফাইল দিন।',
    errorLoad: 'PDF খোলা যায়নি। ফাইলটি নষ্ট বা পাসওয়ার্ড দিয়ে সুরক্ষিত হতে পারে।',
    errorSave: 'PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।',
    langToggle: 'English'
  },
  en: {
    title: 'Add Watermark to PDF',
    subtitle: 'Add a text or logo watermark and download a new PDF. Everything runs in your browser, nothing is uploaded.',
    dropTitle: 'Drop your PDF here',
    dropHint: 'or choose a file from your computer',
    chooseFile: 'Choose PDF',
    privacyNote: 'Your file never leaves your device.',
    newFile: 'Choose another file',
    download: 'Download',
    typeText: 'Text',
    typeImage: 'Image / logo',
    text: 'Watermark text',
    fontSize: 'Font size',
    color: 'Color',
    logo: 'Logo (PNG or JPG)',
    chooseLogo: 'Choose image',
    noLogo: 'No image chosen.',
    errorLogoType: 'Please choose a PNG or JPG image.',
    errorLogoLoad: 'Could not read this image.',
    size: 'Size (% of page width)',
    opacity: 'Opacity',
    position: 'Position',
    posTopLeft: 'Top left',
    posTopCenter: 'Top center',
    posTopRight: 'Top right',
    posMiddleLeft: 'Middle left',
    posMiddleCenter: 'Center',
    posMiddleRight: 'Middle right',
    posBottomLeft: 'Bottom left',
    posBottomCenter: 'Bottom center',
    posBottomRight: 'Bottom right',
    posDiagonal: 'Center diagonal (45°)',
    tile: 'Tile across the whole page',
    tileGap: 'Tile spacing (%)',
    tileHint: 'When tiling, the position only decides the rotation: any spot gives straight tiles, "Diagonal" tilts the tiles by 45°.',
    pagesLabel: 'Apply to',
    pagesAll: 'All pages',
    pagesSpecific: 'Specific pages',
    pagesHint: 'For example: 1-3, 5. Separate page numbers with commas and use a hyphen for ranges.',
    errorFormat: 'Could not read "{token}". Use a format like 1-3, 5.',
    errorRange: '"{token}" is not valid. Use page numbers from 1 to {total}, and write ranges from low to high (like 1-3).',
    summary: '{count} of {total} pages will get the watermark.',
    previewPage: 'Preview of page {page}',
    pagesUnit: 'pages',
    needWatermark: 'Enter some text or choose an image.',
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

/**
 * Parses text like "1-3, 5" into a Set of zero-based page indices.
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

/** Parses an integer and clamps it into [min, max]; returns fallback for empty or invalid text. */
function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Normalizes a /Rotate value to 0, 90, 180 or 270. */
function normalizeRotation(angle) {
  return (((Math.round(angle / 90) * 90) % 360) + 360) % 360;
}

/**
 * Converts a point on the visible (rotated) page into the page's own coordinate
 * space, which is what pdf-lib draws in. The page is displayed rotated clockwise
 * by `rotation`; we undo that here. `box` is the page's visible box (CropBox).
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
  return { x: box.x + ux, y: box.y + uy };
}

/* ==========================================================================
   Watermark helpers (shared by the live preview and the PDF export)
   ========================================================================== */

// Position ids are "row-column" pairs; "diagonal" is the centered 45 degree option
const POSITIONS = [
  { id: 'top-left', key: 'posTopLeft' },
  { id: 'top-center', key: 'posTopCenter' },
  { id: 'top-right', key: 'posTopRight' },
  { id: 'middle-left', key: 'posMiddleLeft' },
  { id: 'middle-center', key: 'posMiddleCenter' },
  { id: 'middle-right', key: 'posMiddleRight' },
  { id: 'bottom-left', key: 'posBottomLeft' },
  { id: 'bottom-center', key: 'posBottomCenter' },
  { id: 'bottom-right', key: 'posBottomRight' }
];
const DIAGONAL = 'diagonal';
const DIAGONAL_ANGLE = 45;     // counterclockwise, so text rises from left to right

const MARGIN = 36;             // distance from the page edge in points (0.5 inch)
const TEXT_RENDER_SCALE = 4;   // text is rasterized at 4 pixels per point (about 288 dpi)
const MAX_STAMP_PX = 6000;     // widest stamp canvas we allow
const MAX_LOGO_PX = 1600;      // logos are downscaled to this size before embedding
const MAX_TILES = 4000;        // safety cap for tiled watermarks
const TEXT_FONT_FAMILY = '"Noto Sans Bengali", "Inter", Arial, sans-serif';

/**
 * Renders the watermark text into a transparent canvas ("stamp").
 * Drawing the text with the browser keeps every language and font working,
 * and the preview and the PDF use exactly the same pixels.
 */
async function buildTextStamp(text, fontSizePt, colorHex) {
  try {
    await Promise.all([
      document.fonts.load('700 40px "Noto Sans Bengali"', text),
      document.fonts.load('700 40px "Inter"', text)
    ]);
  } catch (e) { /* fall back to system fonts */ }

  const fontAt = (px) => '700 ' + px + 'px ' + TEXT_FONT_FAMILY;
  const measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = fontAt(fontSizePt);
  const padding = fontSizePt * 0.15;
  const widthPt = measureCtx.measureText(text).width + padding * 2;
  const heightPt = fontSizePt * 1.5;
  const scale = Math.min(TEXT_RENDER_SCALE, MAX_STAMP_PX / widthPt);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(widthPt * scale));
  canvas.height = Math.max(1, Math.ceil(heightPt * scale));
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.font = fontAt(fontSizePt);
  ctx.fillStyle = colorHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / scale / 2, canvas.height / scale / 2);
  return { kind: 'text', canvas, scale };
}

/** Draws a PNG or JPG logo into a canvas (downscaled if huge) so it can be used as a stamp. */
async function buildImageStamp(file) {
  const bitmap = await createImageBitmap(file);
  const k = Math.min(1, MAX_LOGO_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * k));
  canvas.height = Math.max(1, Math.round(bitmap.height * k));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { kind: 'image', canvas, scale: 1 };
}

/** Size of the stamp on a page in points. Text uses its font size; logos use a % of the page width. */
function getStampSize(stamp, settings, pageWidth) {
  if (stamp.kind === 'text') {
    return { w: stamp.canvas.width / stamp.scale, h: stamp.canvas.height / stamp.scale };
  }
  const w = (pageWidth * settings.sizePct) / 100;
  return { w, h: (w * stamp.canvas.height) / stamp.canvas.width };
}

/**
 * Centers (and rotations) of every stamp on the VISIBLE page, measured from its
 * bottom-left corner in points. Angles are counterclockwise in degrees.
 */
function computePlacements({ position, tile, gapPct, pageWidth: W, pageHeight: H, stampWidth: w, stampHeight: h }) {
  const angle = position === DIAGONAL ? DIAGONAL_ANGLE : 0;
  if (tile) return computeTilePlacements({ angle, gapPct, W, H, w, h });
  if (position === DIAGONAL) return [{ cx: W / 2, cy: H / 2, angle }];

  const [row, col] = position.split('-');
  const cx = col === 'left' ? MARGIN + w / 2 : col === 'right' ? W - MARGIN - w / 2 : W / 2;
  const cy = row === 'top' ? H - MARGIN - h / 2 : row === 'bottom' ? MARGIN + h / 2 : H / 2;
  return [{ cx, cy, angle }];
}

/** A lattice of stamps covering the page, rotated about the page center by `angle`. */
function computeTilePlacements({ angle, gapPct, W, H, w, h }) {
  const stepX = Math.max(8, w * (1 + gapPct / 100));
  const stepY = Math.max(8, h * (1 + gapPct / 100));
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const radius = Math.hypot(W, H) / 2;
  const nx = Math.ceil(radius / stepX);
  const ny = Math.ceil(radius / stepY);
  // Half extents of one rotated stamp, used to skip tiles that are completely off the page
  const halfW = (w * Math.abs(cos) + h * Math.abs(sin)) / 2;
  const halfH = (w * Math.abs(sin) + h * Math.abs(cos)) / 2;

  const out = [];
  for (let j = -ny; j <= ny; j++) {
    for (let i = -nx; i <= nx; i++) {
      const lx = i * stepX;
      const ly = j * stepY;
      const cx = W / 2 + lx * cos - ly * sin;
      const cy = H / 2 + lx * sin + ly * cos;
      if (cx + halfW < 0 || cx - halfW > W || cy + halfH < 0 || cy - halfH > H) continue;
      out.push({ cx, cy, angle });
      if (out.length >= MAX_TILES) return out;
    }
  }
  return out;
}

/** Converts a canvas to PNG bytes. */
function canvasToPngBytes(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error('PNG export failed')); return; }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, 'image/png');
  });
}

/**
 * Stamps the watermark onto the chosen pages with pdf-lib and returns the new bytes.
 * Page content is untouched (nothing is re-rendered), so size and quality stay the same.
 * Rotated pages and CropBoxes are handled by mapping every placement into page space.
 */
async function buildWatermarkedPdf(originalBytes, stamp, s, targetPages) {
  const { PDFDocument, degrees } = PDFLib;
  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const image = await pdfDoc.embedPng(await canvasToPngBytes(stamp.canvas)); // embedded once, reused everywhere

  pdfDoc.getPages().forEach((page, i) => {
    if (!targetPages.has(i)) return;
    const box = page.getCropBox(); // the visible area (falls back to the MediaBox)
    const rotation = normalizeRotation(page.getRotation().angle);
    const swapped = rotation === 90 || rotation === 270;
    const pageWidth = swapped ? box.height : box.width;
    const pageHeight = swapped ? box.width : box.height;
    const size = getStampSize(stamp, s, pageWidth);

    computePlacements({
      position: s.position, tile: s.tile, gapPct: s.gapPct,
      pageWidth, pageHeight, stampWidth: size.w, stampHeight: size.h
    }).forEach((p) => {
      const center = visualToPageSpace({ x: p.cx, y: p.cy }, rotation, box);
      const angle = p.angle + rotation; // the page itself is displayed rotated by `rotation`
      const rad = (angle * Math.PI) / 180;
      // pdf-lib rotates around the image's bottom-left corner, so move that corner
      // to where the rotated stamp's center must end up
      page.drawImage(image, {
        x: center.x - (size.w / 2) * Math.cos(rad) + (size.h / 2) * Math.sin(rad),
        y: center.y - (size.w / 2) * Math.sin(rad) - (size.h / 2) * Math.cos(rad),
        width: size.w,
        height: size.h,
        rotate: degrees(angle),
        opacity: s.opacity
      });
    });
  });
  return pdfDoc.save();
}

/* ==========================================================================
   Add Watermark tool
   ========================================================================== */

// pdf.js worker (pinned to the same version as the script tag)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const $ = (id) => document.getElementById(id);
const els = {
  uploadView: $('uploadView'), editorView: $('editorView'),
  dropzone: $('dropzone'), fileInput: $('fileInput'), chooseBtn: $('chooseBtn'),
  fileName: $('fileName'), fileMeta: $('fileMeta'), status: $('status'), errorBox: $('errorBox'),
  textGroup: $('textGroup'), imageGroup: $('imageGroup'),
  wmText: $('wmText'), fontSize: $('fontSize'), fontSizeOut: $('fontSizeOut'), color: $('color'),
  logoBtn: $('logoBtn'), logoInput: $('logoInput'), logoName: $('logoName'), logoError: $('logoError'),
  sizePct: $('sizePct'), sizePctOut: $('sizePctOut'),
  opacity: $('opacity'), opacityOut: $('opacityOut'),
  posPicker: $('posPicker'), tileHint: $('tileHint'),
  tile: $('tile'), gapField: $('gapField'), gap: $('gap'), gapOut: $('gapOut'),
  pagesInput: $('pagesInput'), pagesError: $('pagesError'),
  summary: $('summary'), previewTitle: $('previewTitle'), previewPaper: $('previewPaper'), overlay: $('overlay'),
  newFileBtn: $('newFileBtn'), downloadBtn: $('downloadBtn'), langToggle: $('langToggle')
};

const state = {
  fileName: '',
  originalBytes: null, // untouched bytes, used by pdf-lib on export
  pdfDoc: null,        // PDF.js document, used only for the preview
  total: 0,
  position: DIAGONAL,
  stamp: null,         // current watermark canvas { kind, canvas, scale }, or null when nothing to draw
  logoStamp: null,     // stamp built from the chosen logo file
  logoFileName: '',
  stampToken: 0,       // cancels outdated stamp builds
  preview: null,       // { pageWidth, pageHeight } of the rendered preview page
  previewIndex: -1,    // zero-based page currently shown in the preview
  previewToken: 0,     // cancels outdated preview renders
  busy: false,
  loadToken: 0         // lets us cancel an older load when a new file is chosen
};

function showError(key) {
  els.errorBox.textContent = t(key);
  els.errorBox.classList.remove('hidden');
}
function clearError() { els.errorBox.classList.add('hidden'); }

function getMode() { return document.querySelector('input[name="mode"]:checked').value; }
function getPagesMode() { return document.querySelector('input[name="pagesMode"]:checked').value; }

/** Reads and sanitizes every setting from the form. */
function readSettings() {
  return {
    mode: getMode(),
    text: els.wmText.value.trim(),
    fontSize: clampInt(els.fontSize.value, 10, 200, 48),
    colorHex: els.color.value,
    sizePct: clampInt(els.sizePct.value, 5, 100, 30),
    opacity: clampInt(els.opacity.value, 5, 100, 30) / 100,
    position: state.position,
    tile: els.tile.checked,
    gapPct: clampInt(els.gap.value, 0, 300, 80)
  };
}

/** Which zero-based pages get the watermark: { pages: Set } or { error }. */
function getTargetPages() {
  if (getPagesMode() === 'all') {
    return { pages: new Set(Array.from({ length: state.total }, (_, i) => i)) };
  }
  return parsePageRanges(els.pagesInput.value, state.total);
}

/** Shows and hides option groups and keeps the value labels in sync. */
function syncControls() {
  const s = readSettings();
  els.textGroup.classList.toggle('hidden', s.mode !== 'text');
  els.imageGroup.classList.toggle('hidden', s.mode !== 'image');
  els.gapField.classList.toggle('hidden', !s.tile);
  els.tileHint.classList.toggle('hidden', !s.tile);
  els.pagesInput.disabled = getPagesMode() === 'all';
  els.fontSizeOut.textContent = s.fontSize + ' pt';
  els.sizePctOut.textContent = s.sizePct + '%';
  els.opacityOut.textContent = Math.round(s.opacity * 100) + '%';
  els.gapOut.textContent = s.gapPct + '%';
  els.logoName.textContent = state.logoFileName || t('noLogo');
}

/** Builds the 9 position buttons plus the diagonal option (also refreshes labels after a language change). */
function renderPositionPicker() {
  els.posPicker.replaceChildren();
  const addButton = (id, key, extraClass) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pos-btn' + (extraClass ? ' ' + extraClass : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(id === state.position));
    btn.setAttribute('aria-label', t(key));
    btn.title = t(key);
    if (extraClass) btn.textContent = t(key);
    btn.addEventListener('click', () => { state.position = id; renderPositionPicker(); refreshPreview(); });
    els.posPicker.appendChild(btn);
  };
  POSITIONS.forEach((pos) => addButton(pos.id, pos.key));
  addButton(DIAGONAL, 'posDiagonal', 'pos-diagonal');
}

/** Draws every stamp onto the overlay canvas using the same placements as the export. */
function drawOverlay() {
  const overlay = els.overlay;
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  if (!state.preview || !state.stamp) return;

  const s = readSettings();
  const { pageWidth, pageHeight } = state.preview;
  const size = getStampSize(state.stamp, s, pageWidth);
  const k = overlay.width / pageWidth; // device pixels per point

  computePlacements({
    position: s.position, tile: s.tile, gapPct: s.gapPct,
    pageWidth, pageHeight, stampWidth: size.w, stampHeight: size.h
  }).forEach((p) => {
    ctx.save();
    ctx.translate(p.cx * k, (pageHeight - p.cy) * k); // flip y: PDF space points up, canvas points down
    ctx.rotate((-p.angle * Math.PI) / 180);           // counterclockwise on screen
    ctx.globalAlpha = s.opacity;
    ctx.drawImage(state.stamp.canvas, (-size.w * k) / 2, (-size.h * k) / 2, size.w * k, size.h * k);
    ctx.restore();
  });
}

/** Enables or disables Download and shows the matching hint. */
function updateDownloadState() {
  if (state.busy) return;
  const target = getTargetPages();
  const hasPages = Boolean(target.pages && target.pages.size > 0);
  els.downloadBtn.disabled = !(state.pdfDoc && state.stamp && hasPages);
  els.status.textContent = state.stamp ? t('ready') : t('needWatermark');
}

/** Rebuilds the stamp (text or logo). Call when text, font, color or mode change. */
async function rebuildStamp() {
  if (!state.pdfDoc) return;
  syncControls();
  const token = ++state.stampToken;
  const s = readSettings();
  let stamp = null;
  try {
    if (s.mode === 'text') {
      if (s.text) stamp = await buildTextStamp(s.text, s.fontSize, s.colorHex);
    } else {
      stamp = state.logoStamp;
    }
  } catch (err) {
    console.error(err);
  }
  if (token !== state.stampToken) return; // a newer build took over
  state.stamp = stamp;
  drawOverlay();
  updateDownloadState();
}

/** Updates the summary and preview; re-renders the page only when the previewed page changes. */
async function refreshPreview() {
  if (!state.pdfDoc) return;
  syncControls();

  const target = getTargetPages();
  els.pagesError.classList.toggle('hidden', !target.error);
  if (target.error) els.pagesError.textContent = t(target.error.key, target.error.vars);
  const count = target.pages ? target.pages.size : 0;
  els.summary.textContent = t('summary', { count, total: state.total });

  // Preview the first page that will actually get the watermark (page 1 if there is none)
  const firstIndex = count > 0 ? Math.min(...target.pages) : 0;
  els.previewTitle.textContent = t('previewPage', { page: firstIndex + 1 });

  if (state.previewIndex !== firstIndex) {
    state.previewIndex = firstIndex;
    state.preview = null;
    els.previewPaper.classList.add('loading');
    const token = ++state.previewToken;
    try {
      const result = await renderPageToCanvas({ pdfDoc: state.pdfDoc, pageNumber: firstIndex + 1, maxSize: 400 });
      if (token !== state.previewToken) return; // a newer render took over
      els.previewPaper.querySelector('canvas.page')?.remove();
      result.canvas.className = 'page';
      els.previewPaper.prepend(result.canvas);
      els.overlay.width = result.canvas.width;
      els.overlay.height = result.canvas.height;
      els.overlay.style.width = result.canvas.style.width;
      els.overlay.style.height = result.canvas.style.height;
      els.previewPaper.classList.remove('loading');
      state.preview = { pageWidth: result.pageWidth, pageHeight: result.pageHeight };
    } catch (err) {
      console.error(err);
      return;
    }
  }
  drawOverlay();
  updateDownloadState();
}

/** Handles a chosen logo file: validates it and builds its stamp. */
async function handleLogoFile(file) {
  els.logoError.classList.add('hidden');
  if (!file) return;
  if (!/^image\/(png|jpeg)$/.test(file.type)) {
    els.logoError.textContent = t('errorLogoType');
    els.logoError.classList.remove('hidden');
    return;
  }
  try {
    state.logoStamp = await buildImageStamp(file);
    state.logoFileName = file.name;
  } catch (err) {
    console.error(err);
    els.logoError.textContent = t('errorLogoLoad');
    els.logoError.classList.remove('hidden');
    return;
  }
  await rebuildStamp();
}

/** Loads a PDF file and resets the preview for it. */
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
    els.previewPaper.querySelector('canvas.page')?.remove();

    els.fileName.textContent = file.name;
    els.fileMeta.textContent = state.total + ' ' + t('pagesUnit');
    els.uploadView.classList.add('hidden');
    els.editorView.classList.remove('hidden');
    await refreshPreview();
    await rebuildStamp();
  } catch (err) {
    console.error(err);
    if (token === state.loadToken) showError('errorLoad');
  }
}

async function handleDownload() {
  const target = getTargetPages();
  if (!state.originalBytes || !state.stamp || state.busy || !target.pages || target.pages.size === 0) return;
  clearError();
  state.busy = true;
  els.downloadBtn.disabled = true;
  els.status.textContent = t('processing');
  try {
    const bytes = await buildWatermarkedPdf(state.originalBytes, state.stamp, readSettings(), target.pages);
    const baseName = state.fileName.replace(/\.pdf$/i, '');
    downloadBytes(bytes, baseName + '-watermarked.pdf');
  } catch (err) {
    console.error(err);
    showError('errorSave');
  } finally {
    state.busy = false;
    updateDownloadState();
  }
}

function resetToUpload() {
  state.loadToken++;
  state.previewToken++;
  state.stampToken++;
  if (state.pdfDoc) { state.pdfDoc.destroy(); state.pdfDoc = null; }
  state.originalBytes = null;
  state.total = 0;
  state.stamp = null;
  state.preview = null;
  state.previewIndex = -1;
  els.previewPaper.querySelector('canvas.page')?.remove();
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

renderPositionPicker();

// Controls that change the stamp itself (text, font size, color, type)
[els.wmText, els.fontSize, els.color].forEach((control) => control.addEventListener('input', rebuildStamp));
document.querySelectorAll('input[name="mode"]').forEach((radio) => radio.addEventListener('change', rebuildStamp));

// Controls that only change where or how the stamp is drawn
[els.sizePct, els.opacity, els.tile, els.gap, els.pagesInput].forEach((control) => {
  control.addEventListener('input', refreshPreview);
  control.addEventListener('change', refreshPreview);
});
document.querySelectorAll('input[name="pagesMode"]').forEach((radio) => radio.addEventListener('change', refreshPreview));

els.logoBtn.addEventListener('click', () => els.logoInput.click());
els.logoInput.addEventListener('change', () => { handleLogoFile(els.logoInput.files[0]); els.logoInput.value = ''; });
els.downloadBtn.addEventListener('click', handleDownload);
els.newFileBtn.addEventListener('click', resetToUpload);
els.langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'bn' ? 'en' : 'bn';
  try { localStorage.setItem('lang', currentLang); } catch (e) { /* ignore */ }
  applyTranslations();
  renderPositionPicker();
  if (state.pdfDoc) {
    els.fileMeta.textContent = state.total + ' ' + t('pagesUnit');
    refreshPreview();
  }
});

applyTranslations();
syncControls();
