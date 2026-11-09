// Creates the DynamoDB table and its two indexes, as described in
// docs/data-model.md.
//   npm run db:setup   creates the table if it doesn't exist yet
//   npm run db:reset   deletes the table and ALL its data, then creates it again
import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
  UpdateTimeToLiveCommand,
  waitUntilTableExists,
  waitUntilTableNotExists,
} from "@aws-sdk/client-dynamodb";
import { getEnv } from "@/server/config/env";
import { getDb } from "@/server/db/client";
import { GSI1, GSI2 } from "@/server/db/keys";
import { reportError } from "./lib/report-error";

async function tableExists(): Promise<boolean> {
  const { client, tableName } = getDb();
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) return false;
    throw error;
  }
}

async function deleteTable() {
  const { client, tableName } = getDb();

  // A safety net: never wipe the real (AWS) database from a script.
  if (!getEnv().DYNAMODB_ENDPOINT) {
    throw new Error(
      "db:reset only works with DynamoDB Local. Delete an AWS table in the AWS console instead.",
    );
  }
  if (!(await tableExists())) return;

  await client.send(new DeleteTableCommand({ TableName: tableName }));
  await waitUntilTableNotExists({ client, maxWaitTime: 60 }, { TableName: tableName });
  console.log(`Deleted table "${tableName}".`);
}

async function createTable() {
  const { client, tableName } = getDb();
  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      BillingMode: "PAY_PER_REQUEST", // on-demand: no capacity to plan
      // Only key attributes are declared; all other attributes are free-form.
      AttributeDefinitions: [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" },
        { AttributeName: "GSI1PK", AttributeType: "S" },
        { AttributeName: "GSI1SK", AttributeType: "S" },
        { AttributeName: "GSI2PK", AttributeType: "S" },
        { AttributeName: "GSI2SK", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" }, // partition key
        { AttributeName: "SK", KeyType: "RANGE" }, // sort key
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: GSI1,
          KeySchema: [
            { AttributeName: "GSI1PK", KeyType: "HASH" },
            { AttributeName: "GSI1SK", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" }, // copy every attribute
        },
        {
          IndexName: GSI2,
          KeySchema: [
            { AttributeName: "GSI2PK", KeyType: "HASH" },
            { AttributeName: "GSI2SK", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    }),
  );

  // Creating a table takes a moment; wait until it's ready to use.
  await waitUntilTableExists({ client, maxWaitTime: 120 }, { TableName: tableName });
  console.log(`Created table "${tableName}" with indexes ${GSI1} and ${GSI2}.`);

  // Let DynamoDB delete expired guest carts and sessions by itself.
  try {
    await client.send(
      new UpdateTimeToLiveCommand({
        TableName: tableName,
        TimeToLiveSpecification: { AttributeName: "ttl", Enabled: true },
      }),
    );
    console.log('Turned on time to live (attribute "ttl").');
  } catch (error) {
    // Not essential: the app checks expiry dates itself as well.
    console.warn(`Note: couldn't turn on time to live (${(error as Error).name}).`);
  }
}

async function main() {
  const { tableName } = getDb();
  if (process.argv.includes("--reset")) await deleteTable();

  if (await tableExists()) {
    console.log(`Table "${tableName}" already exists. Nothing to do.`);
    return;
  }
  await createTable();
}

main().catch((error) => reportError("Setting up the table", error));