import 'dotenv/config';

import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

const normalizeVector = (vector) => {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

//create a sample 1536 dimension vector for testing, 0.1, 0.2, ..., 0.5 repeated
const vectorDimension = 1536;
const sampleVector = [];
for (let i = 0; i < vectorDimension; i++) {
  sampleVector.push(((i % 5) + 1) * 0.1);
}
const normalizedSampleVector = normalizeVector(sampleVector);

const recipe = {
  id: "1",
  title: "Test Recipe",
  ingredients: "1 cup flour, 2 eggs, 1/2 cup sugar",
  steps: "Mix ingredients, bake for 30 minutes",
  embedding: normalizedSampleVector
};

const queryEmbedding1 = normalizedSampleVector;
//random 1536 dimension vector for testing
const randomVector = [];
for (let i = 0; i < vectorDimension; i++) {
  randomVector.push(Math.random());
}
const queryEmbedding2 = normalizeVector(randomVector);

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(process.env.AZURE_SEARCH_ADMIN_KEY)
);

await searchClient.mergeOrUploadDocuments([recipe]);
console.log("Recipe uploaded.");

const options = {
  select: ["id", "title","ingredients"],
  top: 5,
};
options['vectorSearchOptions'] = {
  queries: [
    {
      kind: "vector",
      vector: queryEmbedding1,
      exhaustive: true,
      kNearestNeighborsCount: 50,
      fields: ["embedding"],
    //   threshold: { 
    //     kind: "vectorSimilarity", 
    //     value: 0.7
    //   }
    }
  ]
};
const response = await searchClient.search("*", options);
console.log("Search results:");
for await (const result of response.results) {
  console.log(`ID: ${result.document.id}, Title: ${result.document.title}, Ingredients: ${result.document.ingredients}, Score: ${result.score}`);
}

options['vectorSearchOptions'].queries[0].vector = queryEmbedding2;
const response2 = await searchClient.search("*", options);
console.log("Search results with random vector:");
for await (const result of response2.results) {
  console.log(`ID: ${result.document.id}, Title: ${result.document.title}, Ingredients: ${result.document.ingredients}, Score: ${result.score}`);
}

await searchClient.deleteDocuments("id", ["1"]);
console.log("Recipe deleted.");