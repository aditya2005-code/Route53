import test from "node:test";
import assert from "node:assert";

test("Hosted Zones - Domain Name RFC-1123 pattern validation", () => {
  const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

  // Valid domains
  assert.ok(domainPattern.test("example.com"));
  assert.ok(domainPattern.test("sub.example.co.uk"));
  assert.ok(domainPattern.test("my-cloud-app.io"));

  // Invalid domains
  assert.strictEqual(domainPattern.test("-bad.com"), false);
  assert.strictEqual(domainPattern.test("example"), false);
  assert.strictEqual(domainPattern.test("example..com"), false);
  assert.strictEqual(domainPattern.test("example.c"), false);
});

test("Hosted Zones - Pagination boundary checks", () => {
  const calculatePages = (total: number, limit: number) => {
    return limit > 0 ? Math.ceil(total / limit) : 1;
  };

  assert.strictEqual(calculatePages(25, 10), 3);
  assert.strictEqual(calculatePages(10, 10), 1);
  assert.strictEqual(calculatePages(0, 10), 0);
  assert.strictEqual(calculatePages(1, 10), 1);
});

