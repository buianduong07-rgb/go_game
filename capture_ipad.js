const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  
  // 1. iPad Retina Viewport (1536 x 2048 - 3:4 Tablet Ratio)
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  await page.goto('file:///c:/Users/DELL/Downloads/go_game%20(2)/go_game/index.html', { waitUntil: 'networkidle0' });
  
  // Capture iPad Home Screen
  await page.screenshot({ path: 'C:\\Users\\DELL\\Downloads\\game_ipad_home.jpg', type: 'jpeg', quality: 95 });

  // Capture iPad Gameplay Screen (Go game)
  const goCard = await page.$('.game-card');
  if (goCard) {
    await goCard.click();
    await new Promise(r => setTimeout(r, 600));
  }
  await page.screenshot({ path: 'C:\\Users\\DELL\\Downloads\\game_ipad_gameplay.jpg', type: 'jpeg', quality: 95 });

  // Capture iPad Night Mode Screen
  const themeBtn = await page.$('#btn-theme-toggle');
  if (themeBtn) {
    await themeBtn.click();
    await new Promise(r => setTimeout(r, 800));
  }
  await page.screenshot({ path: 'C:\\Users\\DELL\\Downloads\\game_ipad_night.jpg', type: 'jpeg', quality: 95 });

  await browser.close();
  console.log('IPAD SCREENSHOTS CAPTURED SUCCESSFULLY!');
})();
