// Responsive screenshot helper — usage:
//   node scripts/shot.mjs <url> <name> [widths]
// e.g. node scripts/shot.mjs http://localhost:3000/stories stories-before 390,768,900,1024,1280,1440
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url = process.argv[2];
const name = process.argv[3] || 'shot';
const widths = (process.argv[4] || '390,768,900,1024,1280,1440').split(',').map(Number);

mkdirSync('scripts/shots', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

for (const w of widths) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    console.error('goto error', w, e.message);
  }
  await new Promise((r) => setTimeout(r, 1800));
  const path = `scripts/shots/${name}-${w}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log('saved', path);
  await page.close();
}

await browser.close();
console.log('done');
