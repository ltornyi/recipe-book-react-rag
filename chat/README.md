# RAG-enabled AI chat

## Baseline solution

The classic RAG idea is the following

1. user inputs a query
2. query is added to chat history
3. query is turned into a vector using an embedding model
4. knowledge store is searched using vector (or hybrid) search to find relevant docments
5. prompt is built using instructions and data from decoments found
6. prompt is sent to LLM
7. LLM generates response
8. LLM response is added to chat history and is shown to the user

Sounds great for one-show queries but what about multi-turn conversations (chats)?

## Problem statement

After the first query and response, the user will likely ask a follow-up question. According to
step 2 above, this new query is again turned into a vector, another search is executed, another prompt
is generated based on the search results and so on. Imagine the following conversation

* User: "I want something vegeterian"
    * ...steps 2,3,4,5,6,7 are executed behind the scenes
* LLM: "I can recommend the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach"
* User: "From those, which is the quickest to cook?"

At this point if we continue executing the steps, we will run a vector query based on the question "From those, which is the quickest to cook?", this will produce results which could easily be different from the first search result and the next prompt will be built with this second result set as context.

## Idea

Instead of simply taking each user query and using it to run the similarity search, we will ask the LLM to transform the user's query into a question that can be answered without looking at the chat history:

1. user inputs a query
2. LLM is given the chat history and the user query and LLM is asked to rewrite the user's query into a standalone question
3. reformulated question is added to chat history
4. reformulated question is turned into a vector using an embedding model
5. knowledge store is searched using vector (or hybrid) search to find relevant docments
6. prompt is built using instructions and data from decoments found
7. prompt is sent to LLM
8. LLM generates response
9. LLM response is added to chat history and is shown to the user

If all goes well, the previous conversation will look something like this

* User: "I want something vegeterian"
    * ...step 2 produces the same query, steps 3,4,5,6,7,8 are executed as before
* LLM: "I can recommend the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach"
* User: "From those, which is the quickest to cook?"

At this point, step 2 produces a question like "Considering the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach, which is the quickest to cook?"
and the search and conversation can continue with context preserved.

## Implementation

### Client side

The client will keep the chat history and it will be the client's responsiblity to reformulate the user's query.
It will keep an array of messages in local state; for API purposes, it will have the reformulated query and for UI purposes
it will have the original user prompt.

for the API:

    [
        {role:"user", message:"I want something vegeterian"},
        {role:"assistant", message:"I can recommend the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach"},
        {role:"user", message:"Considering the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach, which is the quickest to cook?"}
    ]

for the UI:

    [
        {role:"user", message:"I want something vegeterian"},
        {role:"assistant", message:"I can recommend the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach"},
        {role:"user", message:"From those, which is the quickest to cook?"}
    ]

### APIs

#### Reformulate user query

The API expects the user's latest query and the chat history. Payload example:

    {
        "userMessage":"From those, which is the quickest to cook?"
        "conversation": [
            {role:"user", content:"I want something vegeterian"},
            {role:"assistant", content:"I can recommend the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach"}
        ]
    }

The API constructs a system prompt to instruct the LLM to reformulate the user's query as astandalone question and adds
the chat history and the current user question as context. Only the last X number of messages will be added from history
to keep token usage in control.

Example system prompt

    You are a query rewriting assistant.

    Your task:
    - Rewrite the user's latest question into a single, standalone question
    - The user's latest question might reference context in the conversation history
    - The rewritten question must be understandable without conversation history
    - Do NOT answer the question
    - Do NOT add new information
    - If it's not needed to rewrite the question, return it as is
    - Return only the rewritten question as plain text

The API response contains the LLM's output which is the reformulated question.

#### Chat

The API expects the user's reformulated query and the chat history. Payload example:

    {
        "userMessage":"Considering the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach, which is the quickest to cook?"
        "conversation": [
            {role:"user", content:"I want something vegeterian"},
            {role:"assistant", content:"I can recommend the Mushroom Soup, the Chickpea Risotto and the Creamy Spinach"}
        ]
    }

The API creates an embedding from the user query, runs a vector (hybrid?) search and pulls in the top 3 results. It constructs a
system prompt to instruct the LLM to provide advice on recipes and will add the search results as context. It uses the
last X-1 messages from the history provided plus the user's reformulated query as chat history.

Example system prompt:

    You are an AI assistant for a recipe application.

    Rules:
    - Answer question using ONLY the recipes listed below
    - If the answer is not contained in the recipes, say you don’t know
    - Return valid JSON with:
    - "answer": string
    - "sources": array of objects. Each object in the array represents a recipe you used in your answer with the recipe id and title as attributes.

    Recipes:
    ...

The API response contains the LLM's output which is the answer and the recipes that were used by the model. The answer is shown
on the UI and links/buttons are displayed to bring up details of recipes used.

## Local testing

When running locally via SWA, execute the following in the browser's dev console:

for reformulate

    (async () => {
        const response = await fetch("http://localhost:4280/api/chat/reformulate", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            conversation: [
                { role: "user", content: "I’m looking for dinner ideas." },
                { role: "assistant", content: "What kind of cuisine are you interested in?" },
                { role: "user", content: "Vegetarian." },
                { role: "assistant", content: "Any ingredients you particularly like or want to avoid?" }
            ],
            userMessage: "What about ones with mushrooms?"
            }),
        });

        const data = await response.json();

        console.log("HTTP status:", response.status);
        console.log("Response:", data);
    })();

for chat

    (async () => {
        const response = await fetch("http://localhost:4280/api/chat", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            conversation: [
                { role: "user", content: "I’m looking for dinner ideas." },
                { role: "assistant", content: "What kind of cuisine are you interested in?" },
                { role: "user", content: "Vegetarian." },
                { role: "assistant", content: "Any ingredients you particularly like or want to avoid?" },
            ],
            // reformulated, standalone question produced by /api/chat/reformulate
            userMessage: "What vegetarian recipes with mushrooms are available?"
            }),
        });

        const data = await response.json();

        console.log("HTTP status:", response.status);
        console.log("Response:", data);
    })();
