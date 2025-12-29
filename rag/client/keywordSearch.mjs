import 'dotenv/config';

import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(process.env.AZURE_SEARCH_ADMIN_KEY)
);

export const keywordSearch = async (query, options) => {
    const searchResults = await searchClient.search(query, options);

    return searchResults;
};

// create a chat loop with the user, exit when QUIT is entered
let input = "";
const readline = await import('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const promptUser = () => {
  return new Promise((resolve) => {
    rl.question("Enter a keyword search query (or QUIT to exit): ", (answer) => {
      resolve(answer);
    });
  });
};

const searchOptions = {
  searchMode: "all",
  includeTotalCount: true,
  select: ["id", "title", "ingredients", "steps"],
  top: 5
};

while (input.trim().toUpperCase() !== "QUIT") {
  input = await promptUser();
  if (input.trim().toUpperCase() === "QUIT") {
    break;
  }

  const results = await keywordSearch(input, searchOptions);
  console.log(`Result count: ${results.count}`);
  for await (const result of results.results) {
    console.log(`- [${result.score}] [${result.document.id}] ${result.document.title}`);
  }
}

rl.close();
