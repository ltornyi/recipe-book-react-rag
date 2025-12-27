import 'dotenv/config';
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";

const createOpenAiClient = (tokenProvider) => {
  const deployment = "Your Azure OpenAI deployment";
  const apiVersion = "2025-01-01-preview";
  const options = { tokenProvider, deployment, apiVersion };
  const client = new AzureOpenAI(options);
  return client;
}

console.log('Creating Azure AD token provider...');
const credential = new DefaultAzureCredential();
const scope = "https://cognitiveservices.azure.com/.default";
const azureADTokenProvider = getBearerTokenProvider(credential, scope);

console.log('Creating OpenAI client...');
const openAiClient = createOpenAiClient(azureADTokenProvider);
console.log('OpenAI client created:', openAiClient !== null);
console.log('Node experiments ready');