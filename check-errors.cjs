const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('UNCAUGHT PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Page loaded successfully');
    
    // Check if there is a React error overlay or specific text
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.includes('react-error-overlay') || bodyHTML.includes('Error:')) {
      console.log('React Error Overlay found!');
      // Try to extract error text
      const errorText = await page.evaluate(() => document.body.innerText);
      console.log('Error text:', errorText.substring(0, 500));
    }
  } catch (err) {
    console.log('Error loading page:', err);
  }

  await browser.close();
})();
