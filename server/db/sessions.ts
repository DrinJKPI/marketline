// Database operations for login sessions (access patterns 4 to 6 in
// docs/data-model.md). Items are keyed by a SHA-256 hash of the session
// token, never the token itself.
import "server-only";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getDb } from "@/server/db/client";
import { keys } from "@/server/db/keys";

export type Session = { userId: string; expiresAt: string };

export async function putSession(
  tokenHash: string,
  session: Session,
): Promise<void> {
  const { doc, tableName } = getDb();
  await doc.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        ...keys.session(tokenHash),
        entityType: "SESSION",
        ...session,
        // DynamoDB deletes the item by itself some time after this moment
        // (Unix time in seconds). See "time to live" in the data model.
        ttl: Math.floor(new Date(session.expiresAt).getTime() / 1000),
      },
    }),
  );
}

export async function getSession(tokenHash: string): Promise<Session | null> {
  const { doc, tableName } = getDb();
  const { Item } = await doc.send(
    new GetCommand({ TableName: tableName, Key: keys.session(tokenHash) }),
  );
  if (!Item) return null;
  return { userId: String(Item.userId), expiresAt: String(Item.expiresAt) };
}

export async function deleteSession(tokenHash: string): Promise<void> {
  const { doc, tableName } = getDb();
  await doc.send(
    new DeleteCommand({ TableName: tableName, Key: keys.session(tokenHash) }),
  );
}