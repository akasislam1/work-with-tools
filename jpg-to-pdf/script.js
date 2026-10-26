/* JPG to PDF - runs entirely in the browser (no server), uses pdf-lib */

/* ---------- Translations ---------- */
const translations = {
  bn: {
    title: 'JPG to PDF',
    subtitle: 'ছবি যোগ করুন, ক্রম ঠিক করুন, এক ক্লিকে PDF বানান। সবকিছু আপনার ব্রাউজারেই হয়, কিছুই আপলোড হয় না।',
    dropTitle: 'ছবি এখানে ছেড়ে দিন বা ক্লিক করে বাছাই করুন',
    dropHint: 'JPG, PNG, WEBP · একসাথে অনেক ছবি দেওয়া যাবে',
    empty: 'এখনও কোনো ছবি যোগ করা হয়নি।',
    count: '{n}টি ছবি',
    adding: 'ছবি যোগ হচ্ছে… {i}/{t}',
    skipped: '{n}টি ফাইল বাদ গেছে (সাপোর্টেড নয় বা পড়া যায়নি)।',
    remove: 'মুছুন',
    rotate: '৯০° ঘোরান',
    drag: 'টেনে ক্রম বদলান',
    pageSize: 'পেজ সাইজ',
    a4: 'A4',
    letter: 'Letter',
    fit: 'ছবির সাইজ',
    orientation: 'ওরিয়েন্টেশন',
    auto: 'স্বয়ংক্রিয় (ছবি অনুযায়ী)',
    portrait: 'পোর্ট্রেট',
    landscape: 'ল্যান্ডস্কেপ',
    margin: 'মার্জিন',
    mNone: 'নেই',
    mSmall: 'ছোট',
    mMedium: 'মাঝারি',
    mLarge: 'বড়',
    make: 'PDF বানাও',
    clear: 'সব মুছুন',
    processing: 'PDF বানানো হচ্ছে… {i}/{t}',
    done: 'PDF তৈরি হয়েছে, ডাউনলোড শুরু হচ্ছে।',
    error: 'PDF বানাতে সমস্যা হয়েছে। কম ছবি দিয়ে আবার চেষ্টা করুন।',
    lang: 'English'
  },
  en: {
    title: 'JPG to PDF',
    subtitle: 'Add images, set the order and create a PDF in one click. Everything runs in your browser; nothing is uploaded.',
    dropTitle: 'Drop images here or click to choose',
    dropHint: 'JPG, PNG, WEBP · many images at once',
    empty: 'No images added yet.',
    count: '{n} image(s)',
    adding: 'Adding images… {i}/{t}',
    skipped: '{n} file(s) skipped (unsupported or unreadable).',
    remove: 'Remove',
    rotate: 'Rotate 90°',
    drag: 'Drag to reorder',
    pageSize: 'Page size',
    a4: 'A4',
    letter: 'Letter',
    fit: 'Same as image',
    orientation: 'Orientation',
    auto: 'Auto (match image)',
    portrait: 'Portrait',
    landscape: 'Landscape',
    margin: 'Margin',
    mNone: 'None',
    mSmall: 'Small',
    mMedium: 'Medium',
    mLarge: 'Large',
    make: 'Create PDF',
    clear: 'Clear all',
    processing: 'Creating PDF… {i}/{t}',
    done: 'PDF created, download is starting.',
    error: 'Could not create the PDF. Try again with fewer images.',
    lang: 'বাংলা'
  }
};

/* ---------- State and elements ---------- */
const $ = (id) => document.getElementById(id);
const els = {
  drop: $('drop'), file: $('file'), list: $('list'), empty: $('empty'),
  status: $('status'), size: $('size'), orient: $('orient'), margin: $('margin'),
  make: $('make'), clear: $('clear'), langBtn: $('langBtn')
};
let lang = 'en';
if (!translations[lang]) lang = 'en';

let items = [];   // { id, file, base (small canvas), w, h, rot }
let nextId = 1;
let busy = false; // true while adding images or creating the PDF
let statusKey = null; // last status message so it can be re-translated

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const THUMB_MAX = 240;   // thumbnail size in px
const EXPORT_MAX = 4096; // longest side in px for images put in the PDF (protects phone memory)

/* ---------- i18n ---------- */
function t(key, vars = {}) {
  let s = translations[lang][key] || key;
  for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
  return s;
}

function setStatus(key, vars) {
  statusKey = key ? { key, vars } : null;
  els.status.textContent = key ? t(key, vars) : '';
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  els.langBtn.textContent = t('lang');
  document.querySelectorAll('.card').forEach(setCardLabels);
  if (statusKey) setStatus(statusKey.key, statusKey.vars);
  else updateCount();
}

els.langBtn.addEventListener('click', () => {
  lang = lang === 'bn' ? 'en' : 'bn';
  try { localStorage.setItem('jpg2pdf-lang', lang); } catch (e) { /* ignore */ }
  applyLang();
});

/* ---------- Image decoding ---------- */
const tick = () => new Promise((r) => setTimeout(r, 0)); // let the browser breathe between files

// Decode a file honoring EXIF orientation. Returns a drawable and its size.
async function decode(file) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    return { src: bmp, w: bmp.width, h: bmp.height, done() { bmp.close(); } };
  } catch (e) {
    // Fallback for older browsers: <img> applies EXIF orientation by default
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    return { src: img, w: img.naturalWidth, h: img.naturalHeight, done() { URL.revokeObjectURL(url); } };
  }
}

// Draw a file onto a canvas, scaled down to maxDim and rotated by rot degrees.
// Also returns the oriented (unrotated) original size.
async function renderFile(file, maxDim, rot = 0) {
  const d = await decode(file);
  try {
    const scale = Math.min(1, maxDim / Math.max(d.w, d.h));
    const w = Math.max(1, Math.round(d.w * scale));
    const h = Math.max(1, Math.round(d.h * scale));
    const swap = rot % 180 !== 0;
    const canvas = document.createElement('canvas');
    canvas.width = swap ? h : w;
    canvas.height = swap ? w : h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // transparent PNG/WEBP areas become white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.drawImage(d.src, -w / 2, -h / 2, w, h);
    return { canvas, ow: d.w, oh: d.h };
  } finally {
    d.done();
  }
}

// Rotate an existing small canvas (used for thumbnails)
function rotateCanvas(src, rot) {
  const swap = rot % 180 !== 0;
  const c = document.createElement('canvas');
  c.width = swap ? src.height : src.width;
  c.height = swap ? src.width : src.height;
  const ctx = c.getContext('2d');
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return c;
}

/* ---------- Adding files ---------- */
async function addFiles(fileList) {
  if (busy) return;
  const all = Array.from(fileList);
  const files = all.filter((f) => ACCEPTED.includes(f.type));
  let skipped = all.length - files.length;
  if (!files.length) { if (skipped) setStatus('skipped', { n: skipped }); return; }

  busy = true;
  updateButtons();
  // Process one file at a time so the page stays responsive
  for (let i = 0; i < files.length; i++) {
    setStatus('adding', { i: i + 1, t: files.length });
    try {
      const r = await renderFile(files[i], THUMB_MAX);
      const item = { id: nextId++, file: files[i], base: r.canvas, w: r.ow, h: r.oh, rot: 0 };
      items.push(item);
      els.list.appendChild(buildCard(item));
    } catch (e) {
      skipped++;
    }
    await tick();
  }
  busy = false;
  if (skipped) setStatus('skipped', { n: skipped }); else setStatus(null);
  syncOrder();
}

/* ---------- Cards (thumbnails) ---------- */
function buildCard(item) {
  const li = document.createElement('li');
  li.className = 'card';
  li.dataset.id = item.id;
  li.innerHTML =
    '<span class="badge"></span>' +
    '<div class="thumb"><img alt=""></div>' +
    '<div class="row">' +
    '<button type="button" class="handle">⠿</button>' +
    '<button type="button" class="rot">⟳</button>' +
    '<button type="button" class="del">✕</button>' +
    '</div>';
  setCardLabels(li);
  paintThumb(li, item);
  return li;
}

function setCardLabels(li) {
  const set = (sel, key) => { const b = li.querySelector(sel); b.title = t(key); b.setAttribute('aria-label', t(key)); };
  set('.handle', 'drag'); set('.rot', 'rotate'); set('.del', 'remove');
}

function paintThumb(li, item) {
  li.querySelector('img').src = rotateCanvas(item.base, item.rot).toDataURL('image/jpeg', 0.75);
}

// Rotate and delete buttons (event delegation)
els.list.addEventListener('click', (e) => {
  if (busy) return;
  const li = e.target.closest('.card');
  if (!li) return;
  const item = items.find((i) => i.id === +li.dataset.id);
  if (e.target.closest('.rot')) {
    item.rot = (item.rot + 90) % 360;
    paintThumb(li, item);
  } else if (e.target.closest('.del')) {
    items = items.filter((i) => i !== item);
    li.remove();
    syncOrder();
  }
});

// Keep the items array in the same order as the thumbnails on screen
function syncOrder() {
  const order = Array.from(els.list.children).map((li) => +li.dataset.id);
  items = order.map((id) => items.find((i) => i.id === id)).filter(Boolean);
  els.list.querySelectorAll('.badge').forEach((b, i) => { b.textContent = i + 1; });
  els.empty.style.display = items.length ? 'none' : '';
  if (!busy && !statusKey) updateCount();
  updateButtons();
}

function updateCount() {
  els.status.textContent = items.length ? t('count', { n: items.length }) : '';
}

function updateButtons() {
  els.make.disabled = busy || !items.length;
  els.clear.disabled = busy || !items.length;
}

els.clear.addEventListener('click', () => {
  items = [];
  els.list.innerHTML = '';
  setStatus(null);
  syncOrder();
});

/* ---------- Drag to reorder (pointer events: mouse + touch) ---------- */
els.list.addEventListener('pointerdown', (e) => {
  const handle = e.target.closest('.handle');
  if (!handle || busy) return;
  e.preventDefault();
  const card = handle.closest('.card');
  card.classList.add('dragging');

  const move = (ev) => {
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    const over = el && el.closest('.card');
    if (!over || over === card || !els.list.contains(over)) return;
    // If the hovered card comes after the dragged one, put the dragged card after it
    const after = card.compareDocumentPosition(over) & Node.DOCUMENT_POSITION_FOLLOWING;
    els.list.insertBefore(card, after ? over.nextSibling : over);
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    card.classList.remove('dragging');
    syncOrder();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
});

/* ---------- Upload: picker and drag & drop ---------- */
els.file.addEventListener('change', () => {
  addFiles(els.file.files).then(() => { els.file.value = ''; });
});
['dragenter', 'dragover'].forEach((ev) => els.drop.addEventListener(ev, (e) => {
  e.preventDefault(); els.drop.classList.add('over');
}));
['dragleave', 'drop'].forEach((ev) => els.drop.addEventListener(ev, (e) => {
  e.preventDefault(); els.drop.classList.remove('over');
}));
els.drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
// Stop the browser from opening a file dropped outside the drop zone
['dragover', 'drop'].forEach((ev) => window.addEventListener(ev, (e) => e.preventDefault()));

/* ---------- Page options ---------- */
function syncOrientState() {
  els.orient.disabled = els.size.value === 'fit'; // orientation makes no sense when page = image size
}
els.size.addEventListener('change', syncOrientState);

const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] }; // in PDF points
const PX_TO_PT = 0.75; // 96 dpi -> 72 dpi

// Work out page size and image placement for one image (cw x ch pixels)
function layoutPage(cw, ch, size, orient, m) {
  if (size === 'fit') {
    const iw = cw * PX_TO_PT, ih = ch * PX_TO_PT;
    return { pw: iw + 2 * m, ph: ih + 2 * m, x: m, y: m, w: iw, h: ih };
  }
  let [pw, ph] = PAGE_SIZES[size];
  const landscape = orient === 'auto' ? cw > ch : orient === 'landscape';
  if (landscape) [pw, ph] = [ph, pw];
  const scale = Math.min((pw - 2 * m) / cw, (ph - 2 * m) / ch);
  const w = cw * scale, h = ch * scale;
  return { pw, ph, x: (pw - w) / 2, y: (ph - h) / 2, w, h };
}

/* ---------- Create PDF ---------- */
els.make.addEventListener('click', async () => {
  if (busy || !items.length) return;
  busy = true;
  updateButtons();
  try {
    const pdf = await PDFLib.PDFDocument.create();
    const size = els.size.value, orient = els.orient.value, m = +els.margin.value;

    // One image at a time: decode, rotate, compress to JPEG, embed, then free memory
    for (let i = 0; i < items.length; i++) {
      setStatus('processing', { i: i + 1, t: items.length });
      await tick();
      const { canvas } = await renderFile(items[i].file, EXPORT_MAX, items[i].rot);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      const img = await pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const L = layoutPage(canvas.width, canvas.height, size, orient, m);
      canvas.width = canvas.height = 0; // release canvas memory right away
      const page = pdf.addPage([L.pw, L.ph]);
      page.drawImage(img, { x: L.x, y: L.y, width: L.w, height: L.h });
    }

    const bytes = await pdf.save();
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'images.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setStatus('done');
  } catch (e) {
    console.error(e);
    setStatus('error');
  } finally {
    busy = false;
    updateButtons();
  }
});

/* ---------- Init ---------- */
syncOrientState();
applyLang();
syncOrder();
