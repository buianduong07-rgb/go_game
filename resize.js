const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  
  const srcImg = 'c:/Users/DELL/Downloads/go_game (2)/go_game/app_icon.jpg';
  if (!fs.existsSync(srcImg)) {
    console.error('Source image not found:', srcImg);
    process.exit(1);
  }
  const imgData = fs.readFileSync(srcImg).toString('base64');
  
  await page.setContent(`
    <html><body>
      <img id="source" src="data:image/jpeg;base64,${imgData}" />
      <canvas id="canvas"></canvas>
    </body></html>
  `);
  
  const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };
  
  const baseDir = 'c:/Users/DELL/Downloads/go_game (2)/android/app/src/main/res';
  
  for (const dir in sizes) {
    const size = sizes[dir];
    const dataUrl = await page.evaluate((size) => {
      const img = document.getElementById('source');
      const canvas = document.getElementById('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      return canvas.toDataURL('image/png');
    }, size);
    
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const outPath1 = path.join(baseDir, dir, 'ic_launcher.png');
    const outPath2 = path.join(baseDir, dir, 'ic_launcher_round.png');
    const outPath3 = path.join(baseDir, dir, 'ic_launcher_foreground.png');
    
    fs.writeFileSync(outPath1, base64Data, 'base64');
    fs.writeFileSync(outPath2, base64Data, 'base64');
    fs.writeFileSync(outPath3, base64Data, 'base64');
    console.log('Generated PNGs for ' + dir);
  }

  // Generate 512x512 store icon
  const storeDataUrl = await page.evaluate(() => {
    const img = document.getElementById('source');
    const canvas = document.getElementById('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 512, 512);
    return canvas.toDataURL('image/png');
  });

  const storeBase64 = storeDataUrl.replace(/^data:image\/png;base64,/, '');
  const playStorePath = 'c:/Users/DELL/Downloads/go_game (2)/play_store_icon_512.png';
  fs.writeFileSync(playStorePath, storeBase64, 'base64');
  console.log('Generated Play Store 512x512 icon at: ' + playStorePath);
  
  await browser.close();
})();
