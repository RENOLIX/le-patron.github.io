const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.SHOP_INSPECT_URL || 'http://127.0.0.1:4173/collections/nos-patrons');
    await page.locator('.card').first().waitFor({ timeout: 25000 });
    console.log('Catalogue:', await page.locator('.count').innerText());
    const links = await page.locator('.card-info h3 a').evaluateAll(nodes => nodes.slice(0, 3).map(node => ({name: node.textContent, href: node.href})));
    for (const link of links) {
      await page.goto(link.href);
      await page.locator('.product-image-frame img').waitFor();
      await page.waitForFunction(() => Array.from(document.querySelectorAll('.product-image-frame img')).every(img => img.complete));
      console.log(JSON.stringify({ expected: link.name, title: await page.locator('.details h1').innerText(), images: await page.locator('.product-image-frame img').evaluateAll(nodes => nodes.map(img => ({ loaded: img.naturalWidth > 0, fit: getComputedStyle(img).objectFit, width: img.naturalWidth, height: img.naturalHeight }))) }));
    }
    console.log('Runtime errors:', JSON.stringify(errors));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
