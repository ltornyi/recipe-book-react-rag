import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { tryGetUser } from "../shared/auth";
import { badRequest, ok, serverError } from "../shared/responseHelpers";
import { ExecuteReformulateQuestion, transformBodyToReformulateQuestionRequest } from "../shared/reformulate";
import { validateReformulateQuestion } from "../shared/validate";

/**
 * Chat API handlers
 */

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
        const reformulatedQuestion = await ExecuteReformulateQuestion(conversation, userMessage);

        return ok({ reformulatedQuestion });
    } catch (err: any) {
        context.error("Unhandled error in listRecipes", err);
        return serverError();
    }
}

app.http('reformulate', {
    route: "chat/reformulate",
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: reformulateQuestion
});