<!-- src/components/admins/LocationManagement/PrintQr.vue -->
<template></template>

<script setup>
import { defineProps, defineExpose } from 'vue';

const props = defineProps({
  /** Full image URL or data: URL to print (e.g., QR code) */
  src: { type: String, required: true },
  /** Title printed above the image (drawn on canvas) */
  title: { type: String, default: '' },

  /** Optional tuning */
  dpr: { type: Number, default: 2 },        // device-pixel ratio for sharpness
  qrSize: { type: Number, default: 480 },   // image size on canvas (px)
  padding: { type: Number, default: 60 },   // outer padding (px)

/** NEW: Title styling */
  titleFontSize: { type: Number, default: 140 },   // <— make this bigger
  titleWeight: { type: String, default: '800' },  // '600' | '700' | '800'
  titleColor: { type: String, default: '#111827' },
  titleGap: { type: Number, default: 36 },        // space below title
});

/* ---------- utils ---------- */

function loadImage(src, useCors = true) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // only set CORS for http(s) when requested
    if (useCors && /^https?:\/\//i.test(src)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function openPrintWindowWithSrc(src, widthPx, title) {
  const w = window.open('', '_blank', 'width=1000,height=600');
  w.document.write(`
    <html>
      <head>
        <title>${title || 'Print Image'}</title>
        <style>
          html,body{margin:0;padding:0}
          img{display:block;max-width:${widthPx || 800}px;width:100%;margin:0 auto}
        </style>
      </head>
      <body>
        <img id="print-img" src="${src}" />
      </body>
    </html>
  `);
  w.document.close();

  const done = () => setTimeout(() => { w.focus(); w.print(); w.close(); }, 120);

  const imgEl = () => w.document.getElementById('print-img');
  const tryPrint = () => {
    const el = imgEl();
    if (!el) return done();
    el.onload = done;
    el.onerror = done;
    if (el.complete) done();
  };

  if (w.document.readyState === 'complete') {
    tryPrint();
  } else {
    w.onload = tryPrint;
  }
}

/* ---------- public methods ---------- */

/**
 * Print the image as PNG/JPG.
 * Attempts CORS-safe canvas export first; if it fails, falls back to printing the original URL.
 * @param {'png'|'jpg'|'jpeg'} format
 */
async function print(format = 'png') {
  if (!props.src) return;

  const DPR = props.dpr;
  const qrSize = props.qrSize;
  const padding = props.padding;
  const title = props.title || '';
  const titleHeight = title ? 80 : 0;
  const width = qrSize + padding * 2;
  const height = qrSize + padding * 2 + titleHeight;

  // 1) Best path: load with CORS and export a clean PNG/JPG
  try {
    const img = await loadImage(props.src, /*useCors*/ true);

    const canvas = document.createElement('canvas');
    canvas.width = width * DPR;
    canvas.height = height * DPR;

    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    // Background (white helps for JPG)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (title) {
      ctx.fillStyle = '#111827';
      ctx.font = '600 24px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(title, width / 2, 24);
    }

    // Center image
    const topOffset = title ? 24 + 40 : padding;
    const qx = (width - qrSize) / 2;
    const qy = topOffset;
    ctx.drawImage(img, qx, qy, qrSize, qrSize);

    const mime = (format === 'jpg' || format === 'jpeg') ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mime, 0.92);

    openPrintWindowWithSrc(dataUrl, width, title);
    return;
  } catch (err) {
    console.warn('CORS canvas export failed, falling back to direct <img> print.', err);
  }

  // 2) Fallback: ensure the original image is reachable and print it directly
  try {
    await loadImage(props.src, /*useCors*/ false);
    openPrintWindowWithSrc(props.src, width, title);
  } catch (err2) {
    console.error('PrintQr.vue print error:', err2);
  }
}

/**
 * Download the image as PNG/JPG.
 * Uses the same canvas pipeline; if CORS blocks it, falls back to downloading the original URL.
 * @param {'png'|'jpg'|'jpeg'} format
 * @param {string} filename
 */
async function download(format = 'png', filename = 'qr') {
  if (!props.src) return;

  const DPR = props.dpr;
  const qrSize = props.qrSize;
  const padding = props.padding;
  const title = props.title || '';
  const titleHeight = title ? 80 : 0;
  const width = qrSize + padding * 2;
  const height = qrSize + padding * 2 + titleHeight;

  // Try canvas export first
  try {
    const img = await loadImage(props.src, /*useCors*/ true);

    const canvas = document.createElement('canvas');
    canvas.width = width * DPR;
    canvas.height = height * DPR;

    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (title) {
      ctx.fillStyle = '#111827';
      ctx.font = '600 24px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(title, width / 2, 24);
    }

    const topOffset = title ? 24 + 40 : padding;
    const qx = (width - qrSize) / 2;
    const qy = topOffset;
    ctx.drawImage(img, qx, qy, qrSize, qrSize);

    const mime = (format === 'jpg' || format === 'jpeg') ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mime, 0.92);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.${format === 'jpeg' ? 'jpg' : format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  } catch (err) {
    console.warn('CORS canvas export failed, falling back to direct URL download.', err);
  }

  // Fallback: direct download (may be blocked by CORS/content-disposition)
  try {
    const a = document.createElement('a');
    a.href = props.src;
    a.download = `${filename}.${format === 'jpeg' ? 'jpg' : format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err2) {
    console.error('PrintQr.vue download error:', err2);
  }
}

defineExpose({ print, download });
</script>
