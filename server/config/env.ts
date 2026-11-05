// Reads and checks the server's environment variables in one place.
// The rest of the code calls getEnv() instead of reading process.env
// directly, so a missing or mistyped variable fails with a clear message.
//
// Why not the usual AWS_REGION / AWS_ACCESS_KEY_ID names? Vercel reserves
// those for its own use, so we use our own DYNAMODB_* names everywhere.
import "server-only"; // build error if this is ever imported into browser code
import { z } from "zod";

// An empty value in .env (e.g. `DYNAMODB_ENDPOINT=`) counts as "not set".
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const envSchema = z.object({
  DYNAMODB_REGION: z.string().min(1),
  DYNAMODB_TABLE_NAME: z
    .string()
    .regex(/^[a-zA-Z0-9_.-]{3,255}$/, "must be 3-255 letters, digits, _ . or -"),
  // Set for DynamoDB Local, left out for real AWS.
  DYNAMODB_ENDPOINT: optional(z.url()),
  DYNAMODB_ACCESS_KEY_ID: z.string().min(1),
  DYNAMODB_SECRET_ACCESS_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

// Checked the first time it's needed (not when the file is imported), so
// `npm run build` works on machines without a database, such as CI.
export function getEnv(): Env {
  if (cached) return cached;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Missing or invalid environment variables:\n${problems}\n` +
        "Copy .env.example to .env and fill in the values.",
    );
  }

  cached = result.data;
  return cached;
}