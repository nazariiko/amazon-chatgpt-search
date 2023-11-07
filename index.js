import express from 'express';
import { readFileSync } from "fs";
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createHTTP } from 'http';
import { createServer as createHTTPS } from 'https';
import { Server } from "socket.io";
import ChatGPTService from './services/chatgpt.js';
import { getSearchResult, parseAmazonProducts, parseAmazonProducts2 } from './services/google.js';
import { getProducts } from './services/amazon.js';

dotenv.config()

const isProduction = process.env.IS_PRODUCTION
const app = express();
let server;

if (isProduction == 'true') {
  server = createHTTPS({
    key: readFileSync("/etc/letsencrypt/live/abx123.com/privkey.pem"),
    cert: readFileSync("/etc/letsencrypt/live/abx123.com/cert.pem")
  }, app);
} else {
  server = createHTTP(app);
}

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
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


server.listen(PORT, () => {
  console.log('Server runs');
})
