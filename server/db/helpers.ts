// Small helpers for DynamoDB operations that need more than one request.
import "server-only";
import {
  BatchGetCommand,
  QueryCommand,
  type BatchGetCommandInput,
  type BatchGetCommandOutput,
  type QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { getDb } from "@/server/db/client";

type Item = Record<string, unknown>;

// One Query returns at most 1 MB of items. When there's more, DynamoDB
// returns a LastEvaluatedKey, and we ask again from there until it's done.
export async function queryAll(
  input: Omit<QueryCommandInput, "TableName">,
): Promise<Item[]> {
  const { doc, tableName } = getDb();
  const items: Item[] = [];
  let startKey: Item | undefined;

  do {
    const page = await doc.send(
      new QueryCommand({
        ...input,
        TableName: tableName,
        ExclusiveStartKey: startKey,
      }),
    );
    items.push(...(page.Items ?? []));
    startKey = page.LastEvaluatedKey;
  } while (startKey);

  return items;
}

const BATCH_SIZE = 100; // the most keys one BatchGetItem request accepts
const MAX_ATTEMPTS = 5;

// Reads many items by key. BatchGetItem takes at most 100 keys, and when
// DynamoDB is busy it may return some of them as "UnprocessedKeys", which
// we retry after a short, growing pause. The order of the results is not
// guaranteed, and keys that don't exist are simply missing.
export async function batchGetAll(
  itemKeys: { PK: string; SK: string }[],
): Promise<Item[]> {
  const { doc, tableName } = getDb();
  const items: Item[] = [];

  for (let start = 0; start < itemKeys.length; start += BATCH_SIZE) {
    let request: BatchGetCommandInput["RequestItems"] = {
      [tableName]: { Keys: itemKeys.slice(start, start + BATCH_SIZE) },
    };

    for (let attempt = 1; request && Object.keys(request).length > 0; attempt++) {
      if (attempt > MAX_ATTEMPTS) {
        throw new Error("DynamoDB is too busy: some items could not be read.");
      }
      if (attempt > 1) await sleep(50 * 2 ** attempt);

      const result: BatchGetCommandOutput = await doc.send(
        new BatchGetCommand({ RequestItems: request }),
      );
      items.push(...(result.Responses?.[tableName] ?? []));
      request = result.UnprocessedKeys;
    }
  }

  return items;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}