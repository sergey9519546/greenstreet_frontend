import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => errors.push({ type: 'pageerror', text: err.message }));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', text: msg.text() });
    }
  });

  try {
    console.log("Navigating to http://localhost:3000/dscr-calculator");
    await page.goto('http://localhost:3000/dscr-calculator', { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Check if the React root is rendered
    const rootHtml = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.substring(0, 500) : "No root element";
    });
    console.log("Root innerHTML prefix:", rootHtml);
    
    // Check for ErrorBoundary text
    const hasErrorBoundary = await page.evaluate(() => {
      return document.body.innerText.includes('Something went wrong');
    });
    console.log("ErrorBoundary shown:", hasErrorBoundary);
  } catch (err) {
    console.error("Navigation failed:", err.message);
  }

  if (errors.length > 0) {
    console.log('\n--- ERRORS FOUND ---');
    errors.forEach(e => console.log(`[${e.type}] ${e.text}`));
  } else {
    console.log('\nNo console errors!');
  }

  await browser.close();
})();
