const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  
  // 1. Mobile Portrait Viewport (iPhone / Android)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('file:///c:/Users/DELL/Downloads/go_game%20(2)/go_game/index.html', { waitUntil: 'networkidle0' });
  
  // Capture Game Play Screen (Click on Go game card)
  const goCard = await page.$('.game-card');
  if (goCard) {
    await goCard.click();
    await new Promise(r => setTimeout(r, 600));
  }
  await page.screenshot({ path: 'C:\\Users\\DELL\\Downloads\\gameplay_go_mobile.jpg', type: 'jpeg', quality: 95 });

  // 2. Capture Night Mode Screen (Click Theme toggle button for night sky & moon)
  const themeBtn = await page.$('#btn-theme-toggle');
  if (themeBtn) {
    await themeBtn.click();
    await new Promise(r => setTimeout(r, 800));
  }
  await page.screenshot({ path: 'C:\\Users\\DELL\\Downloads\\gameplay_night_mobile.jpg', type: 'jpeg', quality: 95 });

  await browser.close();
  console.log('EXTRA MOBILE SCREENSHOTS CAPTURED SUCCESSFULLY!');
})();
