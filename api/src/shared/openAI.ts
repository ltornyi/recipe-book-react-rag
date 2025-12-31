import 'dotenv/config';
import { OpenAI } from "openai";

let client: OpenAI | null = null;

export interface ConversationMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export type Conversation = ConversationMessage[];

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

export const generateChatCompletion = async (messages: Conversation) => {
  const cl = getOpenAIClient();  
  const resp = await cl.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });
  return resp.choices[0].message.content;
};