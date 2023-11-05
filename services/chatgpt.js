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
        console.log('chatgpt-1');
        const completion = await this.openai.chat.completions.create({
          messages: [{ role: "system", content: `Provide a simple product search term for google: "${text}"? Don't write any other text.` }],
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
        const listProduct = products.map((product, index) => {
          return `${index + 1}. ${product.title}. ${product.price}.`
        })
        const completion = await this.openai.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: `
                which of the following list products most closely matches the description "${search}"?
                arrange in order from most suitable. at least 3 products, but more is possible.
                write only the numbers on separate lines. do not write any words or sentences . do not write "none of this items match the description".
                prices are listed at the end, if necessary:
                ${listProduct.join(' ')}
              ` 
            }
          ],
          model: "gpt-4",
        });
        const result = completion.choices[0]['message']['content']
        const resultArr = result.split('\n')
        resolve(resultArr)
      } catch (error) {
        reject(error)
      }
    })
  }
}


