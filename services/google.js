import axios from 'axios';
import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';

export const getSearchResult = (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `https://www.google.com/search?q=${text} site:www.amazon.com`
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
        'ignoreHTTPSErrors': true
      });
      let page = await browser.newPage();
      await page.goto(url);

      const searchResults = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('.g').forEach((result) => {
          const title = result.querySelector('h3').textContent;
          const link = result.querySelector('a').getAttribute('href');
          results.push({ title, link });
        });

        return results;
      });
      
      await browser.close();
      const productLink = searchResults.find(el => {
        if (el.link.includes('/dp/')) {
          return false
        } else {
          return true
        }
      })

      let link = productLink?.link;
      if (!link) {
        link = `https://www.amazon.com/s?k=${text.split(' ').join('+')}`
      } else if (!link.includes('s?k=')) {
        link = `https://www.amazon.com/s?k=${text.split(' ').join('+')}`
      }

      console.log(link);

      resolve(link)
    } catch (error) {
      reject(error)
    }
  })
}

export const parseAmazonProducts = (link) => {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
      'ignoreHTTPSErrors': true,
    });
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36')
    await page.goto(link);
    const data = await page.evaluate(() => document.querySelector('*').outerHTML);
    console.log(data);

    const searchResults = await page.evaluate(() => {
      const results = [];
      const els = document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]')
      Array.from(els).filter(el => el.hasAttribute('data-uuid')).forEach((result) => {
        const a = result.getElementsByTagName('h2')[0].querySelector('a')
        const title = a.getElementsByTagName('span')[0]?.innerText
        const link = 'https://www.amazon.com' + a.getAttribute('href');
        const imageUrl = result.getElementsByTagName('img')[0]?.src
        const priceEl = result.querySelector('.a-price .a-offscreen')
        const price = priceEl ? priceEl.innerText : ''
        results.push({ link, title, imageUrl, price });
      });
  
      return results;
    });
    
    await browser.close();

    resolve(searchResults);
  })
}

export const parseAmazonProducts2 = (link) => {
  return new Promise(async (resolve, reject) => {
    const response = await axios.get(`https://api.scraperapi.com/?api_key=${process.env.SCRAPPER_API}&url=${link}`)
    console.log(response);
    const html = response.data;
    const dom = new JSDOM(html);
    const results = [];
    const els = dom.window.document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]')
    Array.from(els).filter(el => el.hasAttribute('data-uuid')).forEach((result) => {
      let a = result.getElementsByTagName('h2')[0].querySelector('a')
      if (!a) {
        a = result.getElementsByTagName('h2')[1].querySelector('a')
      }
      const title = a.getElementsByTagName('span')[0]?.innerHTML
      const link = 'https://www.amazon.com' + a.getAttribute('href');
      const imageUrl = result.getElementsByTagName('img')[0]?.src
      const priceEl = result.querySelector('.a-price .a-offscreen')
      const price = priceEl ? priceEl.innerHTML : ''
      results.push({ link, title, imageUrl, price });
    });
    resolve(results)
  })
}