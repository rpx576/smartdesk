import type { NextRequest } from "next/server";
import { z } from "zod";
import { AppError, ValidationError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";

type RouteContext<P> = { params: Promise<P> };
type Handler<P> = (request: NextRequest, params: P) => Promise<Response>;

function issuesOf(error: z.ZodError) {
  return error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

/** Maps any thrown value to a JSON error response without leaking internals. */
export function errorResponse(error: unknown): Response {
  if (error instanceof z.ZodError) {
    error = new ValidationError("Invalid request", issuesOf(error));
  }

  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      },
      { status: error.status },
    );
  }

  logger.error("Unhandled error in route handler", { error });
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 },
  );
}

/**
 * Wraps a Route Handler with consistent error handling. Handlers stay thin:
 * authenticate, validate input, call a service, shape the response.
 */
export function route<P = Record<string, never>>(handler: Handler<P>) {
  return async (request: NextRequest, context: RouteContext<P>): Promise<Response> => {
    try {
      return await handler(request, await context.params);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Parses and validates a JSON request body. */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
  return schema.parse(body);
}

/** Validates the query string. */
export function parseQuery<S extends z.ZodType>(request: NextRequest, schema: S): z.output<S> {
  return schema.parse(Object.fromEntries(request.nextUrl.searchParams));
}

/** Validates dynamic route params. */
export function parseParams<S extends z.ZodType>(params: unknown, schema: S): z.output<S> {
  const result = schema.safeParse(params);
  if (!result.success) throw new ValidationError("Invalid path parameter", issuesOf(result.error));
  return result.data;
}
