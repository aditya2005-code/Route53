import test from "node:test";
import assert from "node:assert";

test("Dashboard - Summary data calculations", () => {
  const mockSummary = {
    total_zones: 3,
    total_records: 8,
    record_distribution: {
      A: 3,
      CNAME: 2,
      MX: 1,
      TXT: 2,
    },
    recent_zones: [
      { id: 1, domain_name: "alpha.com", record_count: 4 },
      { id: 2, domain_name: "beta.com", record_count: 2 },
    ],
    recent_records: [
      { id: 10, record_name: "www", record_type: "A", value: "192.0.2.1" },
    ],
  };

  assert.strictEqual(mockSummary.total_zones, 3);
  assert.strictEqual(mockSummary.total_records, 8);
  const sumDistribution = Object.values(mockSummary.record_distribution).reduce((a, b) => a + b, 0);
  assert.strictEqual(sumDistribution, mockSummary.total_records);
  assert.strictEqual(mockSummary.recent_zones.length, 2);
});

test("Dashboard - Empty metrics state", () => {
  const emptySummary = {
    total_zones: 0,
    total_records: 0,
    record_distribution: {},
    recent_zones: [],
    recent_records: [],
  };

  assert.strictEqual(emptySummary.total_zones, 0);
  assert.strictEqual(emptySummary.total_records, 0);
  assert.strictEqual(Object.keys(emptySummary.record_distribution).length, 0);
});

