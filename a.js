require("dotenv").config();
const puppeteer = require('puppeteer-core');

const a = async (browser, evaluate, url) => {
    const page = await browser.newPage();
    // await page.setViewport({width: 1080, height: 1024});
    page.setDefaultNavigationTimeout( 90000 );
    await page.goto(url);
    await page.waitForSelector('.Sections_container__03lu8' || ".EmptyStage_container__oSUiQ")
    console.log('A user connected');
    
    return await evaluate(page)
};

module.exports = { a };