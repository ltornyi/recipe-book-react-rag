import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { tryGetUser } from "../shared/auth";
import { badRequest, ok, serverError } from "../shared/responseHelpers";
import { executeReformulateQuestion, transformBodyToReformulateQuestionRequest } from "../shared/reformulate";
import { validatechatCompletion, validateReformulateQuestion } from "../shared/validate";
import { executeChatCompletion, transformBodyToChatCompletionRequest } from "../shared/chatCompletion";

/**
 * Chat API handlers
 */

export async function chatCompletion(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { user, error } = tryGetUser(request);
        if (error) return error;

        let body: any;
        try {
            body = await request.json();
        } catch (parseErr) {
            return badRequest({ error: "Invalid JSON body" });
        }

        const validationError = validatechatCompletion(body);
        if (validationError) return badRequest(validationError);

        const { conversation, userMessage } = transformBodyToChatCompletionRequest(body);
        const response = await executeChatCompletion(conversation, userMessage, context);

        return ok({ response });
    } catch (err: any) {
        context.error("Unhandled error in chatCompletion", err);
        return serverError();
    }
}

export async function reformulateQuestion(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { user, error } = tryGetUser(request);
        if (error) return error;

        let body: any;
        try {
            body = await request.json();
        } catch (parseErr) {
            return badRequest({ error: "Invalid JSON body" });
        }

        const validationError = validateReformulateQuestion(body);
        if (validationError) return badRequest(validationError);

        const {conversation, userMessage} = transformBodyToReformulateQuestionRequest(body);
        const reformulatedQuestion = await executeReformulateQuestion(conversation, userMessage);

        return ok({ reformulatedQuestion });
    } catch (err: any) {
        context.error("Unhandled error in reformulateQuestion", err);
        return serverError();
    }
}

app.http('chat', {
    route: "chat",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: chatCompletion
});

app.http('reformulate', {
    route: "chat/reformulate",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: reformulateQuestion
});