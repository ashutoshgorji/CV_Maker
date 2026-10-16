#!/usr/bin/env node
/*
 * Make a PDF from a CV text file.
 *
 *   node make-pdf.js my-cv.txt                  -> my-cv.pdf
 *   node make-pdf.js my-cv.txt out.pdf
 *   node make-pdf.js my-cv.txt --photo me.jpg   (or put "photo: me.jpg" in the text)
 *
 * Needs Playwright with Chromium (npm install).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const CV = require('./cv.js');

function loadPlaywright() {
  try { return require('playwright'); } catch (e) {}
  try { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); } catch (e) {}
  console.error('Playwright not found. Run "npm install" in this folder first.');
  process.exit(1);
}

function imageDataUrl(file) {
  const ext = path.extname(file).slice(1).toLowerCase().replace('jpg', 'jpeg');
  return 'data:image/' + ext + ';base64,' + fs.readFileSync(file).toString('base64');
}

async function main() {
  const args = process.argv.slice(2);
  let photoArg;
  const i = args.indexOf('--photo');
  if (i !== -1) { photoArg = args[i + 1]; args.splice(i, 2); }
  const [input, outputArg] = args;
  if (!input) {
    console.error('Usage: node make-pdf.js <cv.txt> [output.pdf] [--photo image.jpg]');
    process.exit(1);
  }

  const text = fs.readFileSync(input, 'utf8');
  const output = outputArg || input.replace(/\.[^./\\]+$/, '') + '.pdf';

  // Photo paths are relative to the text file.
  let photo = photoArg ? path.resolve(photoArg) : CV.parse(text).photo;
  if (photo && !/^(data:|https?:)/.test(photo)) {
    photo = path.resolve(path.dirname(input), photo);
    if (!fs.existsSync(photo)) { console.error('Photo not found: ' + photo); process.exit(1); }
    photo = imageDataUrl(photo);
  }

  const css = pathToFileURL(path.join(__dirname, 'cv.css')).href;
  const html = '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="' + css + '">' +
    '<style>html,body{margin:0}.cv{width:auto;min-height:0;padding:0}</style></head><body>' +
    CV.render(text, { photo: photo || '' }) + '</body></html>';

  const tmp = path.join(__dirname, '.render-tmp.html');
  fs.writeFileSync(tmp, html);
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: output, format: 'A4', preferCSSPageSize: true, printBackground: true });
  } finally {
    await browser.close();
    fs.unlinkSync(tmp);
  }
  console.log('Saved ' + output);
}

main().catch(e => { console.error(e); process.exit(1); });
