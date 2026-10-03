import test from "node:test";
import assert from "node:assert/strict";

import { normalizeEmail, requireString } from "../utils/http-error.js";

test("normalizeEmail trims and lowercases valid addresses", () => {
  assert.equal(normalizeEmail("  TEAM@Example.COM "), "team@example.com");
});

test("normalizeEmail rejects malformed values", () => {
  assert.throws(() => normalizeEmail("not-an-email"), { errorType: "VALIDATION_ERROR" });
});

test("requireString enforces content limits", () => {
  assert.equal(requireString(" title ", "Title", { min: 2, max: 10 }), "title");
  assert.throws(() => requireString("x", "Title", { min: 2 }), { errorType: "VALIDATION_ERROR" });
});
