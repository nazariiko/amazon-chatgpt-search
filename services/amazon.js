import axios from 'axios';

export const getProducts = (search) => {
  return new Promise(async (resolve, reject) => {
    const response = await axios.get(`
      https://ecom.webscrapingapi.com/v1?q=${search}&type=search&amazon_domain=amazon.com&engine=amazon&api_key=${process.env.WEB_SCRAPPER_AMAZON_API_KEY}
    `)

    const productsResult = response.data.search_results.product_results
    const products = productsResult.map(item => {
      return {
        title: item.title,
        imageUrl: item.thumbnail,
        price: item?.price?.raw ? item.price.raw : '',
        link: item.link
      }
    })
    resolve(products)
  })
}