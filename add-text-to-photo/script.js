'use strict';

/* ==========================================================
   Add Text To Photo - step 2
   Multiple text layers, each with its own font, bold/italic,
   outline, shadow and background box. Click a layer (on the
   photo or in the list) to select it; the controls then edit
   that layer. Everything runs in the browser (Canvas API).
   ========================================================== */

/* ---------- Translations ----------
   Every user-facing string lives here. Add a new language by
   adding another key and a button with a matching data-lang. */
const translations = {
  en: {
    title: 'Add Text To Photo',
    subtitle: 'Upload a photo, add text layers, style them, then drag each one into place.',
    dropTitle: 'Drop your photo here',
    dropHint: 'or click to choose a file (JPG, PNG, WebP)',
    layersLabel: 'Text layers',
    addText: 'Add text',
    duplicate: 'Duplicate',
    delete: 'Delete',
    bringForward: 'Bring forward',
    sendBackward: 'Send backward',
    emptyLayer: '(empty text)',
    noLayers: 'No text yet. Press “Add text” to start.',
    textLabel: 'Text',
    textPlaceholder: 'Type your text here',
    defaultText: 'Your text here',
    fontLabel: 'Font',
    fontGroupBengali: 'Bengali + English',
    fontGroupLatin: 'English only',
    bold: 'Bold',
    italic: 'Italic',
    sizeLabel: 'Font size',
    colorLabel: 'Color',
    outline: 'Outline',
    outlineColor: 'Outline color',
    outlineWidth: 'Outline width',
    shadow: 'Shadow',
    shadowColor: 'Shadow color',
    shadowBlur: 'Blur',
    shadowDistance: 'Distance',
    background: 'Background box',
    bgColor: 'Box color',
    bgOpacity: 'Opacity',
    bgPadding: 'Padding',
    bgRadius: 'Corner radius',
    changeImage: 'Choose another photo',
    dragHint: 'Click or touch a text on the photo to select it, then drag to move it.',
    languageLabel: 'Language',
    canvasLabel: 'Photo preview. Select a text and drag it to move it.',
    errorNotImage: 'That file is not an image. Please choose a JPG, PNG or WebP file.',
    errorLoadFailed: 'The image could not be opened. Please try another file.'
  },
  bn: {
    title: 'ছবিতে লেখা যোগ করুন',
    subtitle: 'ছবি আপলোড করুন, একাধিক লেখা যোগ করুন, সাজান, তারপর প্রতিটি টেনে ঠিক জায়গায় বসান।',
    dropTitle: 'ছবিটি এখানে ছেড়ে দিন',
    dropHint: 'অথবা ক্লিক করে ফাইল বাছুন (JPG, PNG, WebP)',
    layersLabel: 'লেখার লেয়ার',
    addText: 'লেখা যোগ করুন',
    duplicate: 'কপি করুন',
    delete: 'মুছুন',
    bringForward: 'সামনে আনুন',
    sendBackward: 'পেছনে পাঠান',
    emptyLayer: '(খালি লেখা)',
    noLayers: 'এখনো কোনো লেখা নেই। শুরু করতে “লেখা যোগ করুন” চাপুন।',
    textLabel: 'লেখা',
    textPlaceholder: 'এখানে আপনার লেখা টাইপ করুন',
    defaultText: 'আপনার লেখা',
    fontLabel: 'ফন্ট',
    fontGroupBengali: 'বাংলা ও ইংরেজি',
    fontGroupLatin: 'শুধু ইংরেজি',
    bold: 'বোল্ড',
    italic: 'ইটালিক',
    sizeLabel: 'ফন্ট সাইজ',
    colorLabel: 'রঙ',
    outline: 'আউটলাইন',
    outlineColor: 'আউটলাইনের রঙ',
    outlineWidth: 'আউটলাইনের পুরুত্ব',
    shadow: 'শ্যাডো',
    shadowColor: 'শ্যাডোর রঙ',
    shadowBlur: 'ঝাপসা ভাব',
    shadowDistance: 'দূরত্ব',
    background: 'ব্যাকগ্রাউন্ড বক্স',
    bgColor: 'বক্সের রঙ',
    bgOpacity: 'অস্বচ্ছতা',
    bgPadding: 'ভেতরের ফাঁকা জায়গা',
    bgRadius: 'কোণের গোলাকার ভাব',
    changeImage: 'অন্য ছবি বাছুন',
    dragHint: 'ছবির ওপর কোনো লেখায় ক্লিক বা টাচ করে সিলেক্ট করুন, তারপর টেনে সরান।',
    languageLabel: 'ভাষা',
    canvasLabel: 'ছবির প্রিভিউ। লেখা সিলেক্ট করে টেনে সরানো যাবে।',
    errorNotImage: 'এটি ছবির ফাইল নয়। অনুগ্রহ করে JPG, PNG বা WebP ফাইল দিন।',
    errorLoadFailed: 'ছবিটি খোলা যায়নি। অন্য একটি ফাইল চেষ্টা করুন।'
  }
};

/* ---------- Constants ---------- */
// "bengali: true" means the font itself contains Bengali glyphs.
// Latin-only fonts fall back to FALLBACK_FONT for Bengali characters.
const FONTS = [
  { name: 'Hind Siliguri', bengali: true },
  { name: 'Noto Sans Bengali', bengali: true },
  { name: 'Noto Serif Bengali', bengali: true },
  { name: 'Baloo Da 2', bengali: true },
  { name: 'Tiro Bangla', bengali: true },
  { name: 'Poppins', bengali: false },
  { name: 'Playfair Display', bengali: false },
  { name: 'Pacifico', bengali: false },
  { name: 'Bebas Neue', bengali: false }
];
const FALLBACK_FONT = 'Hind Siliguri';
const WEIGHT_NORMAL = 500;
const WEIGHT_BOLD = 700;
const LINE_HEIGHT = 1.45;   // Bengali glyphs need a taller line than Latin ones
const MAX_SIDE = 4096;      // Cap the working canvas size to protect memory on phones
const LANG_KEY = 'addTextToPhoto.lang';
const GUIDE_COLOR = '#2f6fed';

/* ---------- State ---------- */
const state = {
  lang: 'en',
  img: null,            // HTMLImageElement
  layers: [],           // drawing order: first = bottom, last = top
  selectedId: null,
  hoverId: null,
  drag: null            // { id, dx, dy } while a layer is being dragged
};

let nextLayerId = 1;

/* ---------- DOM references ---------- */
const $ = (id) => document.getElementById(id);
const dropzone = $('dropzone');
const fileInput = $('fileInput');
const errorBox = $('error');
const editor = $('editor');
const stage = $('stage');
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
const panel = $('panel');
const stylesBox = $('styles');
const layerList = $('layerList');
const noLayers = $('noLayers');
const fontSelect = $('fontSelect');
const textInput = $('textInput');
const addBtn = $('addLayerBtn');
const dupBtn = $('dupLayerBtn');
const delBtn = $('delLayerBtn');
const upBtn = $('upLayerBtn');
const downBtn = $('downLayerBtn');
const changeBtn = $('changeBtn');

/* ==========================================================
   Helpers
   ========================================================== */
function t(key) {
  return translations[state.lang][key];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// "#rrggbb" + alpha (0-1) -> "rgba(r, g, b, a)"
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function selectedLayer() {
  return state.layers.find((l) => l.id === state.selectedId) || null;
}

function layerById(id) {
  return state.layers.find((l) => l.id === id) || null;
}

/* ==========================================================
   Layer model
   Sizes for outline, shadow and background are stored as a
   percentage of the font size, so they scale with the text.
   ========================================================== */
function createLayer(text) {
  return {
    id: nextLayerId++,
    text,
    textEdited: false,   // false until the user types, so the default text can follow the language
    x: 0,                // top-left of the text block, in canvas pixels
    y: 0,
    font: FALLBACK_FONT,
    bold: false,
    italic: false,
    sizePercent: 8,      // font size as a % of the canvas width
    color: '#ffffff',
    outlineOn: false,
    outlineColor: '#000000',
    outlineWidth: 8,
    shadowOn: false,
    shadowColor: '#000000',
    shadowBlur: 12,
    shadowDistance: 6,
    bgOn: false,
    bgColor: '#000000',
    bgOpacity: 70,
    bgPadding: 30,
    bgRadius: 20
  };
}

/* ==========================================================
   Measuring
   ========================================================== */
function fontPx(layer) {
  return (canvas.width * layer.sizePercent) / 100;
}

function fontSpec(layer, family, px) {
  return `${layer.italic ? 'italic ' : ''}${layer.bold ? WEIGHT_BOLD : WEIGHT_NORMAL} ${px}px ${family}`;
}

function cssFont(layer) {
  const stack = `"${layer.font}", "${FALLBACK_FONT}", system-ui, sans-serif`;
  return fontSpec(layer, stack, fontPx(layer));
}

// Measure the text block of a layer (supports multiple lines)
function measureLayer(layer) {
  ctx.font = cssFont(layer);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const fs = fontPx(layer);
  const lines = layer.text.split('\n');
  const lh = fs * LINE_HEIGHT;
  const width = Math.max(...lines.map((line) => ctx.measureText(line).width), 0);
  return { lines, fs, lh, width, height: lh * lines.length };
}

// Full box of a layer, including the background padding when it is on
function layerBounds(layer) {
  const box = measureLayer(layer);
  const pad = layer.bgOn ? (box.fs * layer.bgPadding) / 100 : 0;
  return { box, pad, x: layer.x - pad, y: layer.y - pad, w: box.width + pad * 2, h: box.height + pad * 2 };
}

// Keep the whole box (text + padding) inside the photo whenever it fits
function clampLayer(layer) {
  const b = layerBounds(layer);
  layer.x = clamp(layer.x, b.pad, Math.max(b.pad, canvas.width - b.box.width - b.pad));
  layer.y = clamp(layer.y, b.pad, Math.max(b.pad, canvas.height - b.box.height - b.pad));
}

function centerLayer(layer) {
  const b = layerBounds(layer);
  layer.x = (canvas.width - b.box.width) / 2;
  layer.y = (canvas.height - b.box.height) / 2;
  clampLayer(layer);
}

/* ==========================================================
   Drawing
   ========================================================== */
function roundedRectPath(x, y, w, h, radius) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  // Fallback for older browsers without ctx.roundRect
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawLayer(layer) {
  if (!layer.text.trim()) return;

  const b = layerBounds(layer);
  const { box } = b;

  ctx.save();

  // 1. Background box (behind the text)
  if (layer.bgOn) {
    ctx.fillStyle = hexToRgba(layer.bgColor, layer.bgOpacity / 100);
    roundedRectPath(b.x, b.y, b.w, b.h, (box.fs * layer.bgRadius) / 100);
    ctx.fill();
  }

  ctx.font = cssFont(layer);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const eachLine = (fn) => {
    box.lines.forEach((line, i) => fn(line, layer.x, layer.y + (i + 0.5) * box.lh));
  };

  // 2. Shadow (applies to the outline when there is one, otherwise to the fill)
  if (layer.shadowOn) {
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = (box.fs * layer.shadowBlur) / 100;
    ctx.shadowOffsetX = (box.fs * layer.shadowDistance) / 100;
    ctx.shadowOffsetY = (box.fs * layer.shadowDistance) / 100;
  }

  // 3. Outline: the stroke is centred on the glyph edge and the fill covers its inner half,
  //    so the stroke width is doubled to get the visible width the user asked for.
  if (layer.outlineOn) {
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = ((box.fs * layer.outlineWidth) / 100) * 2;
    ctx.strokeStyle = layer.outlineColor;
    eachLine((line, x, y) => ctx.strokeText(line, x, y));

    // Turn the shadow off so the fill does not cast a second shadow on top of the outline
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // 4. Fill
  ctx.fillStyle = layer.color;
  eachLine((line, x, y) => ctx.fillText(line, x, y));

  ctx.restore();
}

// Selection / hover guides. They are only drawn on the preview, never part of the picture.
function drawGuide(layer, strong) {
  if (!layer || !layer.text.trim()) return;
  const b = layerBounds(layer);
  const lw = Math.max(2, canvas.width / 400);

  ctx.save();
  // White underlay keeps the guide readable on any photo
  ctx.strokeStyle = `rgba(255, 255, 255, ${strong ? 0.9 : 0.6})`;
  ctx.lineWidth = lw * 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = GUIDE_COLOR;
  ctx.globalAlpha = strong ? 1 : 0.7;
  ctx.lineWidth = lw;
  ctx.setLineDash([lw * 4, lw * 3]);
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.restore();
}

// Pass { guides: false } for a clean image (used later by the export step)
function draw({ guides = true } = {}) {
  if (!state.img) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(state.img, 0, 0, canvas.width, canvas.height);
  state.layers.forEach(drawLayer);

  if (guides) {
    if (state.hoverId && state.hoverId !== state.selectedId) drawGuide(layerById(state.hoverId), false);
    drawGuide(selectedLayer(), true);
  }
}

// Redraw, then make sure every web font used by the layers (and the glyph subset for their text)
// is loaded, and redraw once more. Without this, canvas would use a fallback font on first render.
let fontToken = 0;
async function refreshCanvas() {
  draw();
  const token = ++fontToken;
  const jobs = [];
  state.layers.forEach((l) => {
    const sample = l.text || 'Aআ';
    jobs.push(document.fonts.load(fontSpec(l, `"${l.font}"`, 32), sample));
    jobs.push(document.fonts.load(fontSpec(l, `"${FALLBACK_FONT}"`, 32), sample));
  });
  try { await Promise.all(jobs); } catch (e) { /* ignore: fallback font will be used */ }
  if (token === fontToken) draw();
}

// Safety net: redraw whenever the browser finishes loading any font
if (document.fonts && document.fonts.addEventListener) {
  document.fonts.addEventListener('loadingdone', () => draw());
}

/* ==========================================================
   Translations
   ========================================================== */
function buildFontSelect() {
  const current = fontSelect.value || FALLBACK_FONT;
  fontSelect.textContent = '';
  [[true, 'fontGroupBengali'], [false, 'fontGroupLatin']].forEach(([bengali, key]) => {
    const group = document.createElement('optgroup');
    group.label = t(key);
    FONTS.filter((f) => f.bengali === bengali).forEach((f) => {
      const option = document.createElement('option');
      option.value = f.name;
      option.textContent = f.name;
      group.appendChild(option);
    });
    fontSelect.appendChild(group);
  });
  fontSelect.value = current;
}

function applyLanguage(lang) {
  if (!translations[lang]) return;
  state.lang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });

  // Layers the user has not edited yet follow the language
  state.layers.forEach((layer) => {
    if (!layer.textEdited) layer.text = t('defaultText');
  });

  buildFontSelect();
  renderLayerList();
  syncPanel();

  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage may be blocked */ }
  refreshCanvas();
}

/* ==========================================================
   Image loading
   ========================================================== */
function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function handleFile(file) {
  showError('');
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showError(t('errorNotImage'));
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    setImage(img);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    showError(t('errorLoadFailed'));
  };
  img.src = url;
}

function setImage(img) {
  const isFirstImage = !state.img;
  const oldW = canvas.width;
  const oldH = canvas.height;
  state.img = img;

  // Downscale very large photos so the canvas stays within safe limits
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);

  dropzone.hidden = true;
  editor.hidden = false;

  if (isFirstImage) {
    // Start with one text layer centred on the photo
    const layer = createLayer(t('defaultText'));
    state.layers.push(layer);
    state.selectedId = layer.id;
    centerLayer(layer);
  } else {
    // Keep existing layers: move them to the same relative position on the new photo
    state.layers.forEach((layer) => {
      layer.x *= canvas.width / oldW;
      layer.y *= canvas.height / oldH;
      clampLayer(layer);
    });
  }

  renderLayerList();
  syncPanel();
  refreshCanvas();
}

/* ==========================================================
   Layer list and layer actions
   ========================================================== */
function layerLabel(layer) {
  const firstLine = layer.text.split('\n')[0].trim();
  return firstLine || t('emptyLayer');
}

function renderLayerList() {
  layerList.textContent = '';
  // Show the top layer first, like most design tools
  [...state.layers].reverse().forEach((layer) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layer-item';
    btn.textContent = layerLabel(layer);
    btn.setAttribute('aria-pressed', String(layer.id === state.selectedId));
    btn.addEventListener('click', () => selectLayer(layer.id));
    li.appendChild(btn);
    layerList.appendChild(li);
  });
  updateLayerButtons();
}

function updateLayerButtons() {
  const layer = selectedLayer();
  const index = layer ? state.layers.indexOf(layer) : -1;
  dupBtn.disabled = !layer;
  delBtn.disabled = !layer;
  upBtn.disabled = !layer || index === state.layers.length - 1;
  downBtn.disabled = !layer || index === 0;
}

function selectLayer(id) {
  state.selectedId = id;
  renderLayerList();
  syncPanel();
  draw();
}

function addLayer() {
  if (!state.img) return;
  const layer = createLayer(t('defaultText'));
  const n = state.layers.length;
  centerLayer(layer);
  // Spread new layers down the photo so they do not stack exactly on top of each other
  if (n > 0) layer.y = canvas.height * (0.15 + 0.2 * ((n - 1) % 4));
  clampLayer(layer);

  state.layers.push(layer);
  selectLayer(layer.id);
  refreshCanvas();
}

function duplicateLayer() {
  const source = selectedLayer();
  if (!source) return;
  const copy = { ...source, id: nextLayerId++ };
  const offset = fontPx(source) * 0.5;
  copy.x += offset;
  copy.y += offset;
  clampLayer(copy);

  state.layers.splice(state.layers.indexOf(source) + 1, 0, copy);
  selectLayer(copy.id);
}

function deleteLayer() {
  const layer = selectedLayer();
  if (!layer) return;
  const index = state.layers.indexOf(layer);
  state.layers.splice(index, 1);

  const next = state.layers[Math.max(0, index - 1)];
  state.selectedId = next ? next.id : null;
  state.hoverId = null;
  renderLayerList();
  syncPanel();
  draw();
}

function moveLayer(direction) {
  const layer = selectedLayer();
  if (!layer) return;
  const index = state.layers.indexOf(layer);
  const target = index + direction;
  if (target < 0 || target >= state.layers.length) return;

  state.layers[index] = state.layers[target];
  state.layers[target] = layer;
  renderLayerList();
  draw();
}

addBtn.addEventListener('click', addLayer);
dupBtn.addEventListener('click', duplicateLayer);
delBtn.addEventListener('click', deleteLayer);
upBtn.addEventListener('click', () => moveLayer(1));
downBtn.addEventListener('click', () => moveLayer(-1));

/* ==========================================================
   Style controls (bound to the selected layer)
   Every control with data-prop edits the layer property of the same name.
   ========================================================== */
function formatOutput(prop, layer) {
  const value = layer[prop];
  if (prop === 'sizePercent') return `${Math.round(fontPx(layer))} px`;
  if (prop === 'bgOpacity') return `${value}%`;
  if (typeof value === 'string') return value.toUpperCase();
  return String(value);
}

function updateOutputs(layer) {
  panel.querySelectorAll('[data-out]').forEach((out) => {
    out.textContent = formatOutput(out.dataset.out, layer);
  });
}

function updateGroups(layer) {
  panel.querySelectorAll('[data-group]').forEach((group) => {
    group.hidden = !layer[group.dataset.group];
  });
}

// Push the selected layer's values into every control
function syncPanel() {
  const layer = selectedLayer();
  stylesBox.hidden = !layer;
  noLayers.hidden = !!layer || editor.hidden;
  updateLayerButtons();
  if (!layer) return;

  panel.querySelectorAll('[data-prop]').forEach((el) => {
    const value = layer[el.dataset.prop];
    if (el.type === 'checkbox') el.checked = value;
    else el.value = value;
  });
  panel.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(layer[btn.dataset.toggle]));
  });
  updateGroups(layer);
  updateOutputs(layer);
}

// One delegated listener handles every text, select, range, color and checkbox control
panel.addEventListener('input', (e) => {
  const el = e.target;
  const prop = el.dataset.prop;
  const layer = selectedLayer();
  if (!prop || !layer) return;

  let value = el.value;
  if (el.type === 'checkbox') value = el.checked;
  else if (el.type === 'range') value = parseFloat(el.value);
  layer[prop] = value;

  if (prop === 'text') {
    layer.textEdited = true;
    renderLayerList();
  }
  updateGroups(layer);
  updateOutputs(layer);

  // Text and font changes may need a web font to load first
  if (prop === 'text' || prop === 'font') refreshCanvas();
  else draw();
});

// Bold / italic toggle buttons
panel.querySelectorAll('[data-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const layer = selectedLayer();
    if (!layer) return;
    const prop = btn.dataset.toggle;
    layer[prop] = !layer[prop];
    btn.setAttribute('aria-pressed', String(layer[prop]));
    refreshCanvas();
  });
});

/* ==========================================================
   Selecting and dragging on the photo (Pointer Events: mouse, pen, touch)
   ========================================================== */
function pointerToCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * canvas.width) / rect.width,
    y: ((e.clientY - rect.top) * canvas.height) / rect.height
  };
}

function hitTest(layer, p) {
  if (!layer.text.trim()) return false;
  const b = layerBounds(layer);
  // Extra margin makes small text easier to grab with a finger
  const margin = Math.max(12, canvas.width / 60);
  return (
    p.x >= b.x - margin && p.x <= b.x + b.w + margin &&
    p.y >= b.y - margin && p.y <= b.y + b.h + margin
  );
}

// Topmost layer under the pointer
function layerAt(p) {
  for (let i = state.layers.length - 1; i >= 0; i--) {
    if (hitTest(state.layers[i], p)) return state.layers[i];
  }
  return null;
}

canvas.addEventListener('pointerdown', (e) => {
  const p = pointerToCanvas(e);
  const layer = layerAt(p);
  if (!layer) return;

  if (layer.id !== state.selectedId) selectLayer(layer.id);

  state.drag = { id: layer.id, dx: p.x - layer.x, dy: p.y - layer.y };
  canvas.setPointerCapture(e.pointerId);
  canvas.style.cursor = 'grabbing';
  e.preventDefault();
  draw();
});

canvas.addEventListener('pointermove', (e) => {
  const p = pointerToCanvas(e);

  if (state.drag) {
    const layer = layerById(state.drag.id);
    if (!layer) return;
    layer.x = p.x - state.drag.dx;
    layer.y = p.y - state.drag.dy;
    clampLayer(layer);
    draw();
    return;
  }

  const over = layerAt(p);
  const overId = over ? over.id : null;
  if (overId !== state.hoverId) {
    state.hoverId = overId;
    canvas.style.cursor = over ? 'grab' : 'default';
    draw();
  }
});

function endDrag(e) {
  if (!state.drag) return;
  state.drag = null;
  if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  canvas.style.cursor = state.hoverId ? 'grab' : 'default';
  draw();
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

canvas.addEventListener('pointerleave', () => {
  if (state.drag || !state.hoverId) return;
  state.hoverId = null;
  draw();
});

/* ==========================================================
   Upload: click, keyboard and drag & drop
   ========================================================== */
function openFilePicker() {
  fileInput.click();
}

dropzone.addEventListener('click', openFilePicker);
dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openFilePicker();
  }
});
changeBtn.addEventListener('click', openFilePicker);

fileInput.addEventListener('change', () => {
  handleFile(fileInput.files[0]);
  fileInput.value = ''; // allow choosing the same file again
});

// Both the empty drop zone and the stage accept a dropped photo
function bindDrop(el) {
  ['dragenter', 'dragover'].forEach((type) => {
    el.addEventListener(type, (e) => {
      e.preventDefault();
      el.classList.add('is-over');
    });
  });
  ['dragleave', 'drop'].forEach((type) => {
    el.addEventListener(type, (e) => {
      e.preventDefault();
      el.classList.remove('is-over');
    });
  });
  el.addEventListener('drop', (e) => {
    handleFile(e.dataTransfer.files[0]);
  });
}
bindDrop(dropzone);
bindDrop(stage);

// Stop the browser from navigating to the image if it is dropped outside the zones
['dragover', 'drop'].forEach((type) => {
  window.addEventListener(type, (e) => e.preventDefault());
});

/* ==========================================================
   Language switch + init
   ========================================================== */
document.querySelectorAll('[data-lang]').forEach((btn) => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

(function init() {
  let saved = 'en'; // English is the default language
  applyLanguage(translations[saved] ? saved : 'en');
})();
