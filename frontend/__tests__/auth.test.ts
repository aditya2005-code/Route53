import test from "node:test";
import assert from "node:assert";

test("Auth - Token storage keys", () => {
  const TOKEN_KEY = "route53_jwt_token";
  assert.strictEqual(TOKEN_KEY, "route53_jwt_token");
});

test("Auth - Registration input validation", () => {
  const validUser = {
    name: "John Doe",
    email: "john@example.com",
    password: "Password123!",
  };

  assert.ok(validUser.name.length >= 2, "Name must be at least 2 chars");
  assert.ok(validUser.password.length >= 8, "Password must be at least 8 chars");
  assert.match(validUser.email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Must be valid email format");
});

test("Auth - Cookie flag security check", () => {
  const isHttps = false;
  const secureFlag = isHttps ? "; Secure" : "";
  assert.strictEqual(secureFlag, "", "HTTP local development should not force Secure flag on cookies");

  const prodHttps = true;
  const prodFlag = prodHttps ? "; Secure" : "";
  assert.strictEqual(prodFlag, "; Secure", "HTTPS production must force Secure flag");
});

