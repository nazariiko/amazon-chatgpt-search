import OpenAI from 'openai';

export default class ChatGPTService {
  constructor() {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.openai = openai;
  }

  getSimpleSearchTerm = (text) => {
    return new Promise(async (resolve, reject) => {
      try {
        const completion = await this.openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `
                "${text}" if it has a verb: if its a technology related product, just remove superlatives from the phrase. otherwise list a specific product that is a solution. do not write any other words. do not write the words "refurbished" or "affordable". if its regarding a gift write only a creative gift product idea, no other words. otherwise write only the phrase without superlatives. do not write the words "refurbished" or "affordable".
              `,
            },
          ],
          model: 'gpt-4-1106-preview',
        });
        const result = completion.choices[0]['message']['content'].replaceAll('"', '');
        console.log(result);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };

  getBestMatchesProducts = (search, searchTerm, products) => {
    return new Promise(async (resolve, reject) => {
      try {
        const listProduct = products.slice(0, 32).map((product, index) => {
          return `${index + 1}. ${product.title}, Price: ${product.price}.\n`;
        });
        const content1 = `
          ${listProduct.join(' ')}
          which of the above are closest matches for "${searchTerm}"? only write the listing number on a separate line, no words. skip any listings without price. Do not write "None of the listings match..."
        `;
        console.log(content1);
        const response1 = await this.openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: content1,
            },
          ],
          model: 'gpt-4-1106-preview',
        });
        const result1 = response1.choices[0]['message']['content'];
        console.log(result1);

        // const content2 = `
        //   from those results, which one is the "${search}"? only write the listing number on a separate line, no words.
        // `;

        // const response2 = await this.openai.chat.completions.create({
        //   messages: [
        //     {
        //       role: 'system',
        //       content: content1,
        //     },
        //     {
        //       role: 'assistant',
        //       content: result1,
        //     },
        //     {
        //       role: 'user',
        //       content: content2,
        //     },
        //   ],
        //   model: 'gpt-4-1106-preview',
        // });

        // const result2 = response2.choices[0]['message']['content'];
        // console.log(result2);

        const resultArr = result1.split('\n');
        const newResultArr = [];

        for (const item of resultArr) {
          if (item !== undefined) {
            newResultArr.push(item);
          } else {
            break;
          }
        }
        resolve(newResultArr);
      } catch (error) {
        reject(error);
      }
    });
  };
}
