import { InvocationContext } from "@azure/functions";
import { Conversation, generateChatCompletion, generateEmbedding } from "./openAI";
import { hybridSearchRecipes } from "./search";

export interface ChatCompletionRequestBody {
    conversation: Conversation;
    userMessage: string;
}

export interface ChatCompletionResponse {
    answer: string;
    sources: { id: string; title: string }[];
}

export const transformBodyToChatCompletionRequest = (body: any): ChatCompletionRequestBody => {
    return {
        conversation: body.conversation,
        userMessage: body.userMessage,
    };
};

export const executeChatCompletion = async (conversation: Conversation, userMessage: string, context: InvocationContext): Promise<ChatCompletionResponse> => {
    const embedding = await generateEmbedding(userMessage);
    const searchResult = await hybridSearchRecipes(5, userMessage, embedding);

    let recipesText = "[";
    for (const recipe of searchResult) {
        // recipesText += `\n\nRecipe ID: ${recipe.id}\nTitle: ${recipe.title}\nIngredients: ${recipe.ingredients}\n`;
        recipesText += `\n  { "id": "${recipe.id}", "title": "${recipe.title}", "ingredients": "${recipe.ingredients.replace(/"/g, '\\"').replace(/\n/g, ' ')}" },`;
    }
    recipesText += "\n]";

    const systemPrompt = `You are an AI assistant for a recipe application.

    Rules:
    - Answer question using ONLY the recipes listed below
    - The list of recipes provided will be an array in JSON format; each element will have recipe id, title and ingredients attributes
    - If the answer is not contained in the recipes, say you don’t know
    - Provide your answer in the language of the conversation; even if you say you don’t know, say it in the language of the conversation
    - Return valid JSON with:
    - "answer": string
    - "sources": array of objects. Each object in the array represents a recipe you used in your answer with the recipe id and title as attributes.

    Recipes:
    ${recipesText}
    `;

    context.log("System Prompt:", systemPrompt);

    const messages: Conversation = [
        { role: 'system', content: systemPrompt },
        ...conversation,
        { role: 'user', content: userMessage }
    ];

    const resp = await generateChatCompletion(messages);
    context.log("Chat Completion Response:", resp);
    const respJson = JSON.parse(resp);
    return respJson;
};