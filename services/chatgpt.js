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
              content: `"${text}" if it's describing problem write only one specific product name that is a solution, no other words, if it's regarding a gift write a creative gift product idea, no other words, otherwise rewrite it as a simplified google search without price.` 
            }
          ],
          model: "gpt-4-1106-preview",
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
        const listProduct = products.slice(0, 32).map((product, index) => {
          return `${index + 1}. ${product.title}, Price: ${product.price}.\n`
        })
        const content1 = `
          ${listProduct.join(' ')}
          which of the above are the exact matches for "${search}"? just write the listing numbers, do not write any other words.
        `
        console.log(content1);
        const response1 = await this.openai.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: content1,
            }
          ],
          model: "gpt-4-1106-preview",
        });
        const result1 = response1.choices[0]['message']['content']
        console.log(result1);

        const content2 = `
          from those results, which 2 are the "${search}"? only write the listing numbers on separate lines
        `

        const response2 = await this.openai.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: content1,
            },
            {
              role: "assistant",
              content: result1
            },
            {
              role: "user",
              content: content2
            },
          ],
          model: "gpt-4-1106-preview",
        });

        const result2 = response2.choices[0]['message']['content']
        console.log(result2);

        const resultArr = result2.split('\n')
        const newResultArr = [];

        for (const item of resultArr) {
          if (item !== undefined) {
            newResultArr.push(item)
          } else {
            break;
          }
        }
        resolve(newResultArr)
      } catch (error) {
        reject(error)
      }
    })
  }
}


