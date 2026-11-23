import assert from "node:assert/strict";
import test from "node:test";

import { classifyTicket } from "./triage.js";

const cases = [
  {
    name: "classifies refund requests as high-priority billing tickets",
    subject: "Refund request",
    body: "Please reverse the payment",
    category: "BILLING",
    priority: "HIGH",
  },
  {
    name: "classifies locked-out users as urgent login tickets",
    subject: "Locked out",
    body: "Cannot sign in",
    category: "LOGIN",
    priority: "URGENT",
  },
  {
    name: "classifies the required package example as delivery",
    subject: "My package has not arrived",
    body: "Tracking has stopped",
    category: "DELIVERY",
    priority: "HIGH",
  },
  {
    name: "classifies error 500 reports as bugs",
    subject: "Production API error",
    body: "The service returns 500",
    category: "BUG",
    priority: "HIGH",
  },
  {
    name: "uses feature request and medium as fallbacks",
    subject: "Add dark mode",
    body: "Please add a new theme",
    category: "FEATURE_REQUEST",
    priority: "MEDIUM",
  },
];

for (const testCase of cases) {
  test(testCase.name, () => {
    const result = classifyTicket(testCase.subject, testCase.body);

    assert.equal(result.autoCategory, testCase.category);
    assert.equal(result.category, testCase.category);
    assert.equal(result.priority, testCase.priority);
  });
}
