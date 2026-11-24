import assert from "node:assert/strict";
import test from "node:test";

import { escapeRegex } from "./ticketQueryService.js";

test("escapes regular-expression metacharacters in ticket searches", () => {
  const input = ".*+?^${}()|[]\\<script>_%'";
  const escaped = escapeRegex(input);
  const expression = new RegExp(escaped, "i");

  assert.equal(expression.test(input), true);
  assert.equal(expression.test("unrelated ticket"), false);
});
