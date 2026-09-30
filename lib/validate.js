// Input validation shared by API routes (pure functions, unit-tested in tests/validate.test.mjs).

// Deliberately conservative: the waitlist uses the email in a blob path, so no "/", "\\", spaces
// or other unusual characters, and no ".." anywhere.
var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(email) {
  return typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email) && email.indexOf("..") === -1;
}
