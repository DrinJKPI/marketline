// Checks that the app can reach DynamoDB with the settings in .env.
// Run with: npm run db:ping
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { getEnv } from "@/server/config/env";
import { getDb } from "@/server/db/client";

async function main() {
  const env = getEnv();
  const { client, tableName } = getDb();

  const target = env.DYNAMODB_ENDPOINT ?? `AWS (${env.DYNAMODB_REGION})`;
  console.log(`Connecting to DynamoDB at ${target} ...`);

  const { TableNames = [] } = await client.send(new ListTablesCommand({}));
  console.log(
    `OK: connected. Tables: ${TableNames.length > 0 ? TableNames.join(", ") : "(none yet)"}`,
  );

  if (TableNames.includes(tableName)) {
    console.log(`OK: table "${tableName}" exists.`);
  } else {
    console.log(`Note: table "${tableName}" doesn't exist yet (created on Day 2).`);
  }
}

main().catch((error: unknown) => {
  console.error("ERROR: the DynamoDB check failed.");
  // Connection errors sometimes have an empty message but a useful code.
  const code = (error as { code?: string } | null)?.code;
  console.error(`  ${error instanceof Error ? error.message : String(error)}`);
  if (code === "ECONNREFUSED") {
    console.error("  Nothing is answering. Is DynamoDB Local running in its own window?");
  }
  process.exitCode = 1;
});