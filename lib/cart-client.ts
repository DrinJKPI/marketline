// Calls the cart API from the browser. Returns null when it worked, or the
// error message to show (e.g. "You can have at most 4 of this product").

export async function callCartApi(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<string | null> {
  try {
    const response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.ok) return null;
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    return data?.error ?? "Something went wrong. Please try again.";
  } catch {
    return "Couldn't reach the server. Check your connection and try again.";
  }
}