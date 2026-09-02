const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the tutor page
  await page.goto('http://localhost:3000/tutor', { waitUntil: 'load' });
  
  // Wait for 3D canvas to render
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'public/test_screenshot.png' });
  
  await browser.close();
})();
