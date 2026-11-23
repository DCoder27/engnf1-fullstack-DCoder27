const CATEGORY_RULES = [
  {
    category: "BILLING",
    keywords: ["refund", "invoice", "charge", "payment"],
  },
  {
    category: "LOGIN",
    keywords: ["password", "2fa", "sign in", "locked out", "login"],
  },
  {
    category: "DELIVERY",
    keywords: ["package", "arrived", "shipping", "tracking", "delivery"],
  },
  {
    category: "BUG",
    keywords: ["crash", "error", "500", "exception", "broken"],
  },
];

const containsAny = (text, keywords) => {
  return keywords.some((keyword) => text.includes(keyword));
};

export const classifyTicket = (subject, body) => {
  const text = `${String(subject ?? "")} ${String(body ?? "")}`.toLowerCase();

  const matchedRule = CATEGORY_RULES.find(({ keywords }) => {
    return containsAny(text, keywords);
  });

  const category = matchedRule?.category ?? "FEATURE_REQUEST";

  let priority = "MEDIUM";

  if (containsAny(text, ["urgent", "production down", "locked out"])) {
    priority = "URGENT";
  } else if (containsAny(text, ["error", "refund", "not arrived"])) {
    priority = "HIGH";
  }

  return {
    autoCategory: category,
    category,
    priority,
  };
};
