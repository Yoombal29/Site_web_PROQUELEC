import { chromium } from '@playwright/test';

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Authenticate via API and inject token into localStorage to avoid flaky UI login
  await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });
  try {
    const loginResult = await page.evaluate(async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@proquelec.sn', password: 'admin123' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      localStorage.setItem('token', data.access_token);
      return { ok: true };
    });
    console.log('LOGIN_API', loginResult);
  } catch (err) {
    console.error('LOGIN_API_ERR', String(err));
  }
  await page.waitForTimeout(1000);
  const afterLoginUrl = page.url();
  console.log('AFTER_LOGIN_URL', afterLoginUrl);
  await page.goto('http://localhost:5175/admin/builder/testes', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  const afterBuilderUrl = page.url();
  console.log('AFTER_BUILDER_URL', afterBuilderUrl);
  await page.waitForSelector('.cursor-grab', { timeout: 60000 });
  await page.evaluate(() => {
    window.__apiCallCount = 0;
    const realFetch = window.fetch;
    window.fetch = function(input, init) {
      try {
        const url = typeof input === 'string' ? input : input?.url || '';
        if (url.includes('/api/admin/pages')) window.__apiCallCount++;
      } catch (e) {}
      return realFetch.call(this, input, init);
    };
  });
  const item = await page.$('.cursor-grab');
  const box = await item.boundingBox();
  if (!box) {
    console.error('NO_BBOX');
    await browser.close();
    process.exit(1);
  }
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endX = startX + 220;
  const endY = startY + 120;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(startX + (endX - startX) * ((i + 1) / 10), startY + (endY - startY) * ((i + 1) / 10));
    await page.waitForTimeout(60);
  }
  await page.mouse.up();
  await page.waitForTimeout(1600);
  const apiCallCount = await page.evaluate(() => window.__apiCallCount || 0);
  const url = page.url();
  console.log(JSON.stringify({ apiCallCount, url }));
  await browser.close();
};

run().catch((err) => {
  console.error('ERR', err);
  process.exit(1);
});
