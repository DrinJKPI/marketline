// The DynamoDB connection, shared by every database file in server/db/.
import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getEnv } from "@/server/config/env";

type Db = {
  // Low-level client: table admin such as CreateTable and ListTables.
  client: DynamoDBClient;
  // Document client: reads and writes items as plain JavaScript objects,
  // e.g. { name: "Lamp" } instead of DynamoDB's { name: { S: "Lamp" } }.
  doc: DynamoDBDocumentClient;
  tableName: string;
};

let db: Db | undefined;

// Creates the clients on first use and reuses them afterwards.
export function getDb(): Db {
  if (db) return db;

  const env = getEnv();
  const client = new DynamoDBClient({
    region: env.DYNAMODB_REGION,
    endpoint: env.DYNAMODB_ENDPOINT, // undefined = the real AWS endpoint
    credentials: {
      accessKeyId: env.DYNAMODB_ACCESS_KEY_ID,
      secretAccessKey: env.DYNAMODB_SECRET_ACCESS_KEY,
    },
  });

  const doc = DynamoDBDocumentClient.from(client, {
    // Optional fields that are `undefined` are simply left out of the item.
    marshallOptions: { removeUndefinedValues: true },
  });

  db = { client, doc, tableName: env.DYNAMODB_TABLE_NAME };
  return db;
}