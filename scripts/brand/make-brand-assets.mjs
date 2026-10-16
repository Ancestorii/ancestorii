// Builds every logo asset from the master icon (scripts/brand/ancestorii-icon.png):
//   app/favicon.ico (16/32/48), app/icon.png (192), app/apple-icon.png (180, on white),
//   public/logo.png (512, used by the JSON-LD logo and the timeline PDF),
//   public/og-home.jpg and public/og-default.jpg (1200×630 link previews).
// Usage: node scripts/brand/make-brand-assets.mjs   (needs local Chrome for the link previews)
import sharp from 'sharp';
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const SRC = 'scripts/brand/ancestorii-icon.png';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const png = (size) => sharp(SRC).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer();

// ICO with PNG-encoded entries (supported by every current browser).
function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir[o] = size >= 256 ? 0 : size;
    dir[o + 1] = size >= 256 ? 0 : size;
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.buf)]);
}

const sizes = [16, 32, 48];
writeFileSync('app/favicon.ico', ico(await Promise.all(sizes.map(async (size) => ({ size, buf: await png(size) })))));
writeFileSync('app/icon.png', await png(192));
writeFileSync('public/logo.png', await png(512));
// iOS fills transparent corners with black, so the touch icon goes on a full white square.
writeFileSync(
  'app/apple-icon.png',
  await sharp(SRC).flatten({ background: '#ffffff' }).resize(180, 180, { kernel: 'lanczos3' }).png().toBuffer()
);

// ── Link previews ──────────────────────────────────────────────
// The two i's, drawn from the master icon's geometry (stem width 8, viewBox 19×30).
const MARK = `<svg viewBox="0 0 19 30" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="4" r="4" fill="#FF2D87"/><rect y="10" width="8" height="20" rx="4" fill="#0A0A0F"/><circle cx="15" cy="11" r="4" fill="#2B4BFF"/><rect x="11" y="17" width="8" height="13" rx="4" fill="#0A0A0F"/></svg>`;

const BASE = `
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body { position: relative; overflow: hidden; background: #fff; color: #0A0A0F; font-family: 'Plus Jakarta Sans', sans-serif; }
  .glow { position: absolute; left: 50%; border-radius: 50%; transform: translateX(-50%); }
  .pink { top: -470px; width: 1500px; height: 750px; background: radial-gradient(closest-side, #FF2D87, rgba(255,255,255,0)); opacity: .13; }
  .blue { bottom: -430px; width: 1700px; height: 710px; background: radial-gradient(closest-side, #2B4BFF, rgba(255,255,255,0)); opacity: .11; }
  .grad { background-image: linear-gradient(90deg, #FF2D87 0%, #FF7A1A 45%, #2B4BFF 100%); -webkit-background-clip: text; background-clip: text; color: transparent; padding-bottom: .08em; }
  .lockup { display: flex; align-items: center; font-weight: 800; letter-spacing: -.04em; }
  .url { position: absolute; left: 84px; bottom: 64px; font-size: 26px; font-weight: 700; letter-spacing: -.01em; }
</style>`;

const HOME = `<!doctype html><html><head><meta charset="utf-8">${BASE}
<style>
  .lockup { position: absolute; left: 84px; top: 68px; gap: 16px; font-size: 44px; }
  .lockup svg { width: 32px; height: 50px; }
  h1 { position: absolute; left: 84px; top: 182px; width: 1060px; font-size: 112px; line-height: .96; letter-spacing: -.055em; font-weight: 800; }
</style></head><body>
  <div class="glow pink"></div><div class="glow blue"></div>
  <div class="lockup">${MARK}Ancestorii</div>
  <h1>Every family has a story <span class="grad">worth sharing.</span></h1>
  <div class="url">ancestorii.com</div>
</body></html>`;

const DEFAULT = `<!doctype html><html><head><meta charset="utf-8">${BASE}
<style>
  .center { position: absolute; inset: 0 0 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .lockup { gap: 30px; font-size: 128px; line-height: 1; }
  .lockup svg { width: 76px; height: 120px; }
  p { margin-top: 34px; font-size: 44px; line-height: 1.15; font-weight: 800; letter-spacing: -.04em; }
  .url { left: 0; right: 0; text-align: center; }
</style></head><body>
  <div class="glow pink"></div><div class="glow blue"></div>
  <div class="center">
    <div class="lockup">${MARK}Ancestorii</div>
    <p>Your family&rsquo;s greatest stories. <span class="grad">Told together.</span></p>
  </div>
  <div class="url">ancestorii.com</div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
for (const [file, html] of [['public/og-home.jpg', HOME], ['public/og-default.jpg', DEFAULT]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot({ type: 'png' });
  writeFileSync(file, await sharp(shot).resize(1200, 630, { kernel: 'lanczos3' }).jpeg({ quality: 88, mozjpeg: true }).toBuffer());
  await page.close();
}
await browser.close();
console.log('brand assets written');
