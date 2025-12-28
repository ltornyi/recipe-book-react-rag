import 'dotenv/config';

import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(process.env.AZURE_SEARCH_ADMIN_KEY)
);

const id = process.argv[2];

if (!id) {
  console.error("Please provide an id to delete.");
  process.exit(1);
}

await searchClient.deleteDocuments("id", [id]);