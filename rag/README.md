# Azure AI Search to support RAG

## Set up Azure AI Search index

See example `index.json` for reference.

1. Create Azure AI Search resource in the portal (same region as the SWA)
2. Create index

    1. Add fields title, ingredients and steps - Edm.String types and all should be retrievable and searchable.
    2. Add field "embedding" - Collection(Edm.Single), retrievable and searchable. Dimension is 1536 and create vector search profile
    3. The vector search profile should feature a hnsw algorithm and cosine similarity. Compression can be binary quantization to save storage space.

3. Copy the Url from the overview page.
4. Copy the admin key value (needed because write operations).

## Deploy embedding and chatcompletion model

1. Create a new project in Azure AI Foundry
2. Go to the foundry resource in the Azure portal, copy the openAI endpoint and the key - find these under `Settings -> Keys and endpoint`.
3. Deploy the `text-embedding-3-small` model
4. Deploy the `gpt-4o-mini` model

## PoC search client

### Project setup

    npm init -y
    npm install dotenv openai @azure/search-documents

Added `"type": "module"` to `package.json`.

### Environment variables

Edit `.env` and add the following environment variables:

    OPENAI_BASE_URL=https://your-foundry-resource.openai.azure.com/openai/v1/
    OPENAI_API_KEY=your-foundry-resource-api-key
    AZURE_SEARCH_SERVICE_ENDPOINT=https://your-search-resource.search.windows.net
    AZURE_SEARCH_ADMIN_KEY=your-search-resource-admin-key
    AZURE_SEARCH_INDEX_NAME=your-index-name

### Check openAI connectivity and deployments

Change model names in `checkOpenAI.mjs` if needed; try running it.

### Check Azure AI search connectivity and functionality.

Review `checkSearch.mjs`; try running it. Review `deleteBuId.mjs` and `keywordSearch.mjs` for example usecases.

## Design and functionality

### on recipe create or update

* concatenate title,ingredients and steps
* generate embedding, using 1536 dimension model (text-embedding-3-small)
* build JSON document
* store in Azure AI search index:

        searchClient.mergeOrUploadDocuments([document])

### on recipe delete
    
* delete from Azure AI search index:

        searchClient.deleteDocuments(keyName, [keyValue])

### vector search

* take query string from user
* generate embedding for query string
* execute vector search (similarity threshold is a preview feature)

        options = {
            select: ["id","title","ingredients"],
            top: 5,
            vectorSearchOptions: {
                queries: [
                    {
                        kind:"vector",
                        vector:"<generated embedding>",
                        exhaustive: true,
                        kNearestNeighborsCount: 50,
                        fields:["embedding"],
                        "threshold": { 
                            "kind": "vectorSimilarity", 
                            "value": <threshold>
                        }
                    }
                ]
            }
        }
        searchClient.search("*",options)

* display records with score in grid
* doubleclick queries Azure SQL Database and displays details in dialog