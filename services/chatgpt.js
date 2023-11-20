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
              content: `If the text is about a gift, come up with a creative gift idea. if it's describing a problem find only one easiest to use specific product name and no other words. otherwise, write the words as they are, without superlatives: "${text}"` 
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
        const listProduct = products.slice(0, 16).map((product, index) => {
          return `${index + 1}. ${product.title}, Price: ${product.price}.\n`
        })
        const content = `
          ${listProduct.join(' ')}
          which 2 of the above are the exact matches for "${search}"? just write the listing numbers, do not write any other words.
        `
        console.log(content);
        const completion = await this.openai.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: content,
            }
          ],
          model: "gpt-4-1106-preview",
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


