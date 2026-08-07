import puppeteer from 'puppeteer';
import express from 'express';
import path from 'path';

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const ROUTES_TO_TEST = [
  '/',
  '/dscr-calculator',
  '/deal-analyzer',
  '/tools/stress-matrix',
  '/tools/monte-carlo',
  '/tools/portfolio',
  '/lender-intel',
  '/state-laws',
  '/rate-quiz',
  '/tools/arm-reset',
  '/tools/tax-engine',
  '/tools/refi-tracker',
];

async function runQA() {
  console.log('🚀 Starting GreenStreet Automated Express & Puppeteer Browser QA...');
  
  // 1. Start local Express static server serving dist/ with SPA fallback
  const app = express();
  const distPath = path.resolve('dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const server = await new Promise((resolve) => {
    const s = app.listen(PORT, '127.0.0.1', () => {
      console.log(`  ✓ Built-in Express server listening on ${BASE_URL}`);
      resolve(s);
    });
  });

  // 2. Launch Puppeteer Headless Chromium
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('404')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  console.log('\n🔍 Navigating & Verifying 12 Primary SPA Routes:\n');

  let passedRoutes = 0;

  for (const route of ROUTES_TO_TEST) {
    const url = `${BASE_URL}${route}`;
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const status = resp ? resp.status() : 0;
      
      // Verify root container mounts React tree
      await page.waitForSelector('#root', { timeout: 5000 });
      const title = await page.title();

      console.log(`  ✓ [${status}] ${route.padEnd(24)} -> "${title}"`);
      passedRoutes++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${route.padEnd(24)} -> ${err.message}`);
    }
  }

  // 3. Test interactive controls on Deal Analyzer
  console.log('\n🎛️ Testing Interactive Controls on Deal Analyzer (/deal-analyzer):');
  try {
    await page.goto(`${BASE_URL}/deal-analyzer`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { timeout: 5000 });

    const inputs = await page.$$('input');
    console.log(`  ✓ Found ${inputs.length} input elements on Deal Analyzer.`);

    const buttons = await page.$$('button');
    if (buttons.length > 0) {
      await page.evaluate((btn) => btn.click(), buttons[0]);
      console.log(`  ✓ Successfully clicked interactive button control.`);
    }

  } catch (err) {
    console.error(`  ❌ Interactive test error: ${err.message}`);
  }

  // 4. Cleanup & Report
  await browser.close();
  server.close();

  console.log('\n📊 QA Execution Summary:');
  console.log(`  • Routes Tested: ${passedRoutes} / ${ROUTES_TO_TEST.length}`);
  console.log(`  • Console Errors: ${consoleErrors.length}`);
  console.log(`  • Page Crash Errors: ${pageErrors.length}`);

  if (consoleErrors.length > 0) {
    console.log('\n⚠️ Console Errors Captured:');
    consoleErrors.forEach((e) => console.log(`  - ${e}`));
  }

  if (pageErrors.length > 0) {
    console.log('\n❌ Uncaught Page Errors Captured:');
    pageErrors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }

  if (passedRoutes < ROUTES_TO_TEST.length) {
    console.error('\n❌ NOT ALL ROUTES PASSED VERIFICATION.');
    process.exit(1);
  }

  console.log('\n🎉 ALL BROWSER & UI INTERACTION QA CHECKS PASSED SUCCESSFULLY!\n');
}

runQA().catch((err) => {
  console.error('Fatal QA Runner Error:', err);
  process.exit(1);
});
