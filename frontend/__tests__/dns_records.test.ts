import test from "node:test";
import assert from "node:assert";

test("DNS Records - IPv4 format validation for A records", () => {
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  assert.ok(ipv4Pattern.test("192.0.2.1"));
  assert.ok(ipv4Pattern.test("1.1.1.1"));
  assert.strictEqual(ipv4Pattern.test("999.999.999.999"), false);
  assert.strictEqual(ipv4Pattern.test("example.com"), false);
});

test("DNS Records - TTL ranges", () => {
  const isValidTTL = (ttl: number) => ttl >= 60 && ttl <= 86400;

  assert.ok(isValidTTL(60));
  assert.ok(isValidTTL(300));
  assert.ok(isValidTTL(86400));
  assert.strictEqual(isValidTTL(10), false);
  assert.strictEqual(isValidTTL(100000), false);
});

test("DNS Records - Priority requirement for MX and SRV", () => {
  const requiresPriority = (type: string) => ["MX", "SRV"].includes(type);

  assert.ok(requiresPriority("MX"));
  assert.ok(requiresPriority("SRV"));
  assert.strictEqual(requiresPriority("A"), false);
  assert.strictEqual(requiresPriority("CNAME"), false);
  assert.strictEqual(requiresPriority("TXT"), false);
});

