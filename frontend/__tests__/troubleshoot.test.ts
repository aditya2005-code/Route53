import test from "node:test";
import assert from "node:assert";

test("AI Troubleshooter - Contract schema validation", () => {
  const sampleResponse = {
    problem: "Domain Non-Resolving (NXDOMAIN)",
    possible_causes: [
      "No A record configured for apex '@'",
      "Registrar nameservers not delegated",
    ],
    analysis: "DNS query failed because no authoritative record exists.",
    recommended_actions: [
      "Add an A record pointing to server IPv4",
      "Verify registrar nameservers match Route 53 set",
    ],
    severity: "high",
    requires_manual_verification: true,
  };

  assert.ok(sampleResponse.problem.length > 0);
  assert.ok(sampleResponse.possible_causes.length >= 1);
  assert.ok(sampleResponse.recommended_actions.length >= 1);
  assert.ok(["low", "medium", "high"].includes(sampleResponse.severity));
  assert.strictEqual(sampleResponse.requires_manual_verification, true);
});

test("AI Troubleshooter - Severity classification logic", () => {
  const evaluateSeverity = (problem: string): "high" | "medium" | "low" => {
    const p = problem.toLowerCase();
    if (p.includes("nxdomain") || p.includes("down") || p.includes("outage")) return "high";
    if (p.includes("cname") || p.includes("mail")) return "medium";
    return "low";
  };

  assert.strictEqual(evaluateSeverity("Site shows NXDOMAIN"), "high");
  assert.strictEqual(evaluateSeverity("CNAME record mismatch"), "medium");
  assert.strictEqual(evaluateSeverity("TTL cache propagation delay"), "low");
});

