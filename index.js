import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ChatGPTService from './services/chatgpt.js';
import { getSearchResult, parseAmazonProducts } from './services/google.js';
import { getProducts } from './services/amazon.js';

dotenv.config()

const app = express();
app.use(cors({
  origin: '*'
}));

const PORT = 3000 || process.env.PORT
const chatgptServiceInstance = new ChatGPTService();


app.get('/search', async (req, res) => {
  try {
    const dateStart = new Date()
    const text = req.query.text;
    const searchTerm = await chatgptServiceInstance.getSimpleSearchTerm(text);

    console.log('chatgpt-1');

    let productResults;

    const link = await getSearchResult(searchTerm);
    productResults = await parseAmazonProducts(link)

    // productResults = await getProducts(searchTerm)

    const bestMatchesProductsIndexes = await chatgptServiceInstance.getBestMatchesProducts(text, productResults);
    const finalProducts = [];
    bestMatchesProductsIndexes.forEach(index => {
      finalProducts.push(productResults[+index - 1])
    })

    const top3Products = finalProducts.slice(0, 3)

    const dateEnd = new Date()
    const time = dateEnd - dateStart;
    console.log(time / 1000);
    res.json({ status: 200, products: top3Products, error: null })
  } catch (error) {
    res.json({ status: 400, error: error, products: null })
  }
})

app.get('/test', (req, res) => {
  res.send('<h2>Working</h2>')
})


app.listen(PORT, () => {
  console.log('Server runs');
})