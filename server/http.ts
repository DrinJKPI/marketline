// Shared helpers for our API routes (app/api/...): reading a JSON body
// safely, and turning errors into consistent JSON responses like
// { "error": "Quantity must be at least 1." } with the right status code.
import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { CartError } from "@/server/services/cart";

export class BadRequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "BadRequestError";
  }
}

// Reads the request body as JSON and checks it against a zod schema.
// Only JSON is accepted: a form on another website can't send JSON to us
// without the browser asking our permission first (CORS), which we never give.
export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new BadRequestError("Send the request body as JSON.", 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BadRequestError("The request body isn't valid JSON.");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0]?.message ?? "Invalid request.");
  }
  return result.data;
}

// Known problems become a helpful message; anything unexpected is logged
// on the server and the visitor gets a general message (no internal details).
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof BadRequestError || error instanceof CartError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}