import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  const routesToTest = [
    'http://localhost:3000/',
    'http://localhost:3000/dscr-calculator',
    'http://localhost:3000/lender-intel',
    'http://localhost:3000/state-laws',
    'http://localhost:3000/faq',
    'http://localhost:3000/blog',
    'http://localhost:3000/rate-quiz'
  ];

  for (const url of routesToTest) {
    console.log(`\nTesting: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
      
      // Check for PageShell existence (for non-marketing pages)
      if (url !== 'http://localhost:3000/') {
        const hasPageShell = await page.evaluate(() => {
          // Check for elements that are part of the new design
          return document.body.innerHTML.includes('Outfit') || document.body.innerText.includes('DSCR');
        });
        console.log(`Loaded successfully. Content check passed: ${hasPageShell}`);
      } else {
        console.log(`Loaded marketing page successfully.`);
      }
    } catch (err) {
      console.log(`Failed to load ${url}:`, err.message);
    }
  }

  if (errors.length > 0) {
    console.log('\n--- Console Errors ---');
    errors.forEach(e => console.log(e));
  } else {
    console.log('\nNo console errors found!');
  }

  await browser.close();
})();
