import 'dotenv/config';
import { OpenAI } from "openai";

let client: OpenAI | null = null;

export const getOpenAIClient = () => {
  if (!client) {
    client = new OpenAI();
  }
  return client;
};

export const generateEmbedding = async (inputString: string) => {
  const cl = getOpenAIClient();  
  const resp = await cl.embeddings.create({
    model: "text-embedding-3-small",
    input: inputString,
  });
  return resp.data[0].embedding;
};