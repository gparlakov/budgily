import { Configuration, OpenAIApi } from 'openai';

// const _eval = await import('eval').then((e) => e.default);

export interface MovementImport {}

const gptKey = process.env.BUDGILY_CHAT_GPT_API_KEY;

declare function translateBankStatement(i: string): MovementImport[];

export async function importViaGPT(
  input: string
): Promise<{ result?: MovementImport[]; error?: { message: string; original?: Error } }> {
  console.log('----key', gptKey);
  if (!gptKey) {
    return { error: { message: 'Missing ChatGPT API KEY' } };
  }

  const configuration = new Configuration({
    apiKey: gptKey,
  });
  const openai = new OpenAIApi(configuration);

  try {
    // const response = await openai.createChatCompletion({
    //   model: 'gpt-3.5-turbo',
    //   messages: [
    //     {
    //       role: 'system',
    //       content:
    //         'You will be provided with structured bank statement data that needs to be translated to an array of javascript objects containing these exact properties: amount, date, type: credit/debit, receiving account, sender, description and raw containing the whole object JSON.stringified. The output should be just one javascript function named translateBankStatement that can be used in nodejs context to translate similar data accepting a single argument named data with the raw text of the input. The function should rely on fast-xml-parser for xml parsing and csvParse from d3 for csv parsing',
    //     },
    //     { role: 'user', content: input.slice(0, 5000) },
    //   ],
    //   temperature: 0,
    //   max_tokens: 1056,
    //   top_p: 1,
    //   frequency_penalty: 0,
    //   presence_penalty: 0,
    // });

    // const fn = response.data.choices[0].message?.content;
    const fn =
      'const {XMLParser} = require("fast-xml-parser");\n' +
      'module.exports = function translateBankStatement(data) {\n' +
      '  const parser = new XMLParser({ unpairedTags: ["br", "hr"], stopNodes: ["*.br"], textNodeName: "$_text", });\n' +
      '  const xmlDoc = parser.parse(data);\n' +
      '  const accountMovements = xmlDoc.AccountMovements.AccountMovement;\n' +
      '  const result = [];\n' +
      '\n' +
      '  for (let i = 0; i < accountMovements.length; i++) {\n' +
      '    const movement = accountMovements[i];\n' +
      '    const valueDate = movement.ValueDate;\n' +
      '    const reason = movement.Reason;\n' +
      '    const oppositeSideName = movement.OppositeSideName;\n' +
      '    const oppositeSideAccount = movement.OppositeSideAccount;\n' +
      '    const movementType = movement.MovementType;\n' +
      '    const amount = movement.Amount;\n' +
      '\n' +
      '    const description = reason.replace(/<br\\/>/g, "\\n");\n' +
      '    const raw = JSON.stringify(movement);\n' +
      '\n' +
      '    const movementObj = {\n' +
      '      amount: amount,\n' +
      '      date: valueDate,\n' +
      '      type: movementType === "Debit" ? "debit" : "credit",\n' +
      '      receivingAccount: oppositeSideAccount,\n' +
      '      sender: oppositeSideName,\n' +
      '      description: description,\n' +
      '      raw: raw\n' +
      '    };\n' +
      '\n' +
      '    result.push(movementObj);\n' +
      '  }\n' +
      '\n' +
      '  return result;\n' +
      '}';

    // const resultFn = _eval(fn, 'translate.ts', {}, true);
    // console.log('typeof result', typeof resultFn);

    // if (typeof resultFn === 'function') {
    //   return { result: resultFn(input) };
    // } else {
    //   return { error: { message: 'not a function' } };
    // }
  } catch (e) {
    try {
      if (e satisfies { toJSON: () => string }) {
        console.log(e.toJSON());
      } else {
        console.log(e);
      }
    } catch {
      console.log(e);
    }
    return {
      error: {
        message: (e satisfies { message: string }) ? e?.message : 'Could not parse the data',
        original: e instanceof Error ? e : undefined,
      },
    };
  }
}
