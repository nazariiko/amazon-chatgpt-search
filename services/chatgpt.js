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
              content: `If the text is about a gift, come up with a creative gift idea. if it's describing a problem, or sounds like a question, find only one easiest to use specific product name and no other words. otherwise, just remove superlatives, the word "ram", and write the words leftover. do not add quotation marks. Include price as it is written and brand name and model name if included: "${text}"` 
            }
          ],
          model: "gpt-4",
        });
        const result = completion.choices[0]['message']['content'].replaceAll('"', '')
        console.log(result);
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  getBestMatchesProducts = (search, products) => {
    return new Promise(async (resolve, reject) => {
      try {
        const listProduct = products.slice(0, 17).map((product, index) => {
          return `${index + 1}. ${product.title}, Price: ${product.price}.`
        })
        const content = `
          ${listProduct.join(' ')}
          "${search}". First remove superlatives and then find the exact matches. Then rank according to the superlatives. List 2 results. If there are 2 same matches, pick the cheaper one. opt for kits when available. write only the numbers on separate lines. do not write any words or sentences. prices are listed at the end, if necessary.
        `
        console.log(content);
        const completion = await this.openai.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: content,
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


