import { HttpResponseInit } from "@azure/functions";

export function ok(body: any): HttpResponseInit { return { status: 200, jsonBody: body }; }
export function created(body: any): HttpResponseInit { return { status: 201, jsonBody: body }; }
export function noContent(): HttpResponseInit { return { status: 204 }; }
export function badRequest(body: any): HttpResponseInit { return { status: 400, jsonBody: body }; }
export function unauthorized(message: any): HttpResponseInit { return { status: 401, jsonBody: { error: message } }; }
export function forbidden(message: any): HttpResponseInit { return { status: 403, jsonBody: { error: message } }; }
export function serverError(message?: any): HttpResponseInit { return { status: 500, jsonBody: { error: message || "Internal server error" } }; }
export function notImplemented(message?: any): HttpResponseInit { return { status: 501, jsonBody: { error: message || "Not implemented" } }; }
