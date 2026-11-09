// Checks that the app can reach DynamoDB with the settings in .env.
// Run with: npm run db:ping
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { getEnv } from "@/server/config/env";
import { getDb } from "@/server/db/client";
import { reportError } from "./lib/report-error";

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
    console.log(`Note: table "${tableName}" doesn't exist yet. Run: npm run db:setup`);
  }
}

main().catch((error) => reportError("The DynamoDB check", error));