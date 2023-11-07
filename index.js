import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from "socket.io";
import ChatGPTService from './services/chatgpt.js';
import { getSearchResult, parseAmazonProducts, parseAmazonProducts2 } from './services/google.js';
import { getProducts } from './services/amazon.js';

dotenv.config()

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.use(cors({
  origin: '*'
}));

const PORT = 3000 || process.env.PORT
const chatgptServiceInstance = new ChatGPTService();


app.get('/search', async (req, res) => {
  const socket = io.of('/search');
  const dateStart = new Date()
  const text = req.query.text;
  const searchTerm = await chatgptServiceInstance.getSimpleSearchTerm(text);

  socket.emit('message', '1')

  let productResults;

  const link = await getSearchResult(searchTerm);

  socket.emit('message', '2')

  productResults = await parseAmazonProducts2(link);

  socket.emit('message', '3')

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
})

app.get('/test', (req, res) => {
  res.send('<h2>Working</h2>')
})


io.of('/search').on('connection', (socket) => {
  console.log('A client connected to /search namespace');

  socket.on('disconnect', () => {
    console.log('A client disconnected from /search namespace');
  });
});


app.listen(PORT, () => {
  console.log('Server runs');
})