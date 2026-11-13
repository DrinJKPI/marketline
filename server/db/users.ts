// Database operations for users (access patterns 1 to 3 in
// docs/data-model.md). The password hash never leaves the server: only
// findUserForLogin returns it, and only to the login code.
import "server-only";
import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { getDb } from "@/server/db/client";
import { keys } from "@/server/db/keys";
import type { User } from "@/types/user";

// Thrown by createUser when the email already has an account.
export class EmailTakenError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "EmailTakenError";
  }
}

// A stored user item -> a User (without the password hash or keys).
function toUser(item: Record<string, unknown>): User {
  return {
    id: String(item.id),
    email: String(item.email),
    name: String(item.name),
    createdAt: String(item.createdAt),
  };
}

// Creates a user. DynamoDB can only keep a *key* unique, so the email gets
// its own "lock" item (EMAIL#<email>). Both items are written in one
// transaction: if the email is taken, its condition fails and neither
// item is written, even if two people sign up at the same moment.
export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const { doc, tableName } = getDb();
  const user: User = {
    id: crypto.randomUUID(),
    email: input.email.toLowerCase(),
    name: input.name,
    createdAt: new Date().toISOString(),
  };

  try {
    await doc.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                ...keys.email(user.email),
                entityType: "EMAIL",
                userId: user.id,
              },
              ConditionExpression: "attribute_not_exists(PK)",
            },
          },
          {
            Put: {
              TableName: tableName,
              Item: {
                ...keys.user(user.id),
                entityType: "USER",
                ...user,
                passwordHash: input.passwordHash,
              },
              ConditionExpression: "attribute_not_exists(PK)",
            },
          },
        ],
      }),
    );
  } catch (error) {
    const reasons = (error as { CancellationReasons?: { Code?: string }[] })
      .CancellationReasons;
    if (reasons?.[0]?.Code === "ConditionalCheckFailed") {
      throw new EmailTakenError();
    }
    throw error;
  }

  return user;
}

// A user by ID, or null.
export async function getUserById(userId: string): Promise<User | null> {
  const { doc, tableName } = getDb();
  const { Item } = await doc.send(
    new GetCommand({ TableName: tableName, Key: keys.user(userId) }),
  );
  return Item ? toUser(Item) : null;
}

// For logging in only: the user with this email and their password hash,
// or null. Two reads: the email lock gives the user ID, then the user.
export async function findUserForLogin(
  email: string,
): Promise<{ user: User; passwordHash: string } | null> {
  const { doc, tableName } = getDb();
  const { Item: lock } = await doc.send(
    new GetCommand({ TableName: tableName, Key: keys.email(email) }),
  );
  if (!lock) return null;

  const { Item } = await doc.send(
    new GetCommand({ TableName: tableName, Key: keys.user(String(lock.userId)) }),
  );
  if (!Item) return null;
  return { user: toUser(Item), passwordHash: String(Item.passwordHash) };
}