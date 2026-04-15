import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    await page.goto('http://localhost:3000/admin', {waitUntil: 'networkidle2'}).catch(e=>console.log(e));
    await new Promise(r => setTimeout(r, 2000));
    const content = await page.content();
    console.log(content.substring(0, 300)); // check if HTML is there
    await browser.close();
})();
