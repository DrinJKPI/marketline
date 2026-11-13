// Where to send someone after logging in, e.g. /login?next=/cart.
// Only paths on this site are allowed: "//evil.com" or "https://evil.com"
// would otherwise turn our login page into a launch pad for phishing.

export function safeNextPath(value: unknown, fallback = "/account"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }
  return value;
}