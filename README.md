# Recipe book

This project demonstrates the usage of Azure Static Web App with managed functions, Oracle Autonomous Database via ORDS, Azure AI Search and Azure OpenAI. The frontend app provides three main functional areas:

1. Recipe maintenance: CRUD operations and traditional search/sort capabilities.
2. Semantic search: given a user input, displays top n similar recipes based on vector embeddings.
3. AI-chat: chatbot experience that leverages RAG to ground the AI model.

## Frontend

React SPA deployed as an Azure Static Web App (SWA). See `ui` for details.

## APIs

The endpoints are implemented as an Azure Function App as part of the SWA deployment. The endpoints provide CRUD operations for the Oracle database, See `api` for details.

## Database

Oracle Autonomous Database is used to store the relational datasets and ORDS endpoints are used to access the data. See `db` for details.

## Semantic search

Azure AI Search is used to provide vector search (semantic search) capabilities. See `rag` for details.

## AI chat

more to come...