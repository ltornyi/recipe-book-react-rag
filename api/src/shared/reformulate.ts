import { Conversation, generateChatCompletion } from "./openAI";

export interface ReformulateQuestionRequestBody {
    conversation: Conversation;
    userMessage: string;
}

export const transformBodyToReformulateQuestionRequest = (body: any): ReformulateQuestionRequestBody => {
    return {
        conversation: body.conversation,
        userMessage: body.userMessage,
    };
};

export const ExecuteReformulateQuestion = async (conversation: Conversation, userMessage: string): Promise<string> => {
    const systemPrompt = `You are a query rewriting assistant.

    Your task:
    - Rewrite the user's latest question into a single, standalone question
    - The user's latest question might reference context in the conversation history
    - The rewritten question must be understandable without conversation history
    - Do NOT answer the question
    - Do NOT add new information
    - If it's not needed to rewrite the question, return it as is
    - Return only the rewritten question as plain text";`;

    const messages: Conversation = [
        { role: 'system', content: systemPrompt },
        ...conversation,
        { role: 'user', content: userMessage }
    ];

    const resp = await generateChatCompletion(messages);

    return resp;
};