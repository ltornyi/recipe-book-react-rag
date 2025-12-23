import 'dotenv/config';
import { OpenAI } from "openai";

const client = new OpenAI();

const tryEmbedding = async () => {
  const resp = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: "Hello world"
  });
  return resp;
};

const tryChatCompletion = async () => {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello, how are you?" }
    ]
  });
  return resp;
};

console.log('Creating embedding...');
const embedding = await tryEmbedding();
console.log('Embedding response:', embedding);

console.log('Creating chat...');
const chatCompletion = await tryChatCompletion();
console.log('Chat completion response:', chatCompletion);
console.log('Response:', chatCompletion.choices[0].message.content);