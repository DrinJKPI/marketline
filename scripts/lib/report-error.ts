// Shared error output for the database scripts: the error itself, a
// plain-English hint when we recognise the problem, and a failing exit code
// so a chained command (e.g. `npm run db:setup && npm run db:seed`) stops.

const hints: Record<string, string> = {
  ECONNREFUSED: "Nothing is answering. Is DynamoDB Local running?",
  ENOTFOUND: "The address can't be found. Check DYNAMODB_REGION and your internet connection.",
  UnrecognizedClientException: "AWS doesn't know this access key. Check DYNAMODB_ACCESS_KEY_ID.",
  InvalidSignatureException: "The secret key doesn't match. Check DYNAMODB_SECRET_ACCESS_KEY.",
  AccessDeniedException: "The keys work, but the IAM user isn't allowed to do this. Check its policy.",
  ResourceNotFoundException: "The table doesn't exist yet. Run `npm run db:setup` first.",
};

export function reportError(task: string, error: unknown): void {
  console.error(`ERROR: ${task} failed.`);
  console.error(`  ${error instanceof Error ? error.message : String(error)}`);

  // Network errors have a `code`; AWS errors have a `name`.
  const code = (error as { code?: string } | null)?.code ?? "";
  const name = error instanceof Error ? error.name : "";
  const hint = hints[code] ?? hints[name];
  if (hint) console.error(`  ${hint}`);

  process.exitCode = 1;
}