import OpenAI from 'openai';

export default class ChatGPTService {
  constructor() {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.openai = openai
  }

  getSimpleSearchTerm = (text) => {
    return new Promise(async (resolve, reject) => {
      try {
        const completion = await this.openai.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: `if it is about a gift, come up with a creative gift idea. if it's describing a problem, write a product name that will solve it. if it sounds like a question, only write the product name and no other words. otherwise, remove superlatives and the word ram and provide a simpler product search term for amazon.com. do not add adjectives or write anything else or add quotation marks. "$${text}"` 
            }
          ],
          model: "gpt-4",
        });
        const result = completion.choices[0]['message']['content'].replaceAll('"', '')
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  getBestMatchesProducts = (search, products) => {
    return new Promise(async (resolve, reject) => {
      try {
        const listProduct = products.slice(0, 31).map((product, index) => {
          return `${index + 1}. ${product.title}. ${product.price}.`
        })
        console.log(listProduct);
        const completion = await this.openai.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: `
                ${listProduct.join(' ')}
                which 3 of the above are the closest match for: "${search}"? If there are 2 same matches, pick the cheaper one. write only the numbers on separate lines do not write any words or sentences. prices are listed at the end, if necessary.
              `,
              // content: `
              //   which of the following list products most closely matches the description "${search}"?
              //   arrange in order from most suitable. at least 3 products, but more is possible.
              //   write only the numbers on separate lines. do not write any words or sentences . do not write "none of this items match the description".
              //   prices are listed at the end, if necessary:
              //   ${listProduct.join(' ')}
              // `
            }
          ],
          model: "gpt-4",
        });
        const result = completion.choices[0]['message']['content']
        console.log(result);
        const resultArr = result.split('\n')
        resolve(resultArr)
      } catch (error) {
        reject(error)
      }
    })
  }
}


