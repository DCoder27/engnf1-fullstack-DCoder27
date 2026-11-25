import Ticket from "../models/Ticket.js";

const CATEGORIES = ["BILLING", "BUG", "FEATURE_REQUEST", "LOGIN", "DELIVERY"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const buildCountMap = (values, rows) => {
  const counts = Object.fromEntries(values.map((value) => [value, 0]));

  for (const row of rows) {
    counts[row._id] = row.count;
  }

  return counts;
};

export const getTicketStats = async () => {
  const [facets] = await Ticket.aggregate([
    {
      $facet: {
        byCategory: [
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ],
        byPriority: [
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        reviewed: [
          { $match: { isReviewed: true } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              agreementCount: {
                $sum: {
                  $cond: [{ $eq: ["$category", "$autoCategory"] }, 1, 0],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  const reviewed = facets.reviewed[0] ?? {
    count: 0,
    agreementCount: 0,
  };

  const modelAgreementRate =
    reviewed.count === 0
      ? 0
      : Number(((reviewed.agreementCount / reviewed.count) * 100).toFixed(2));

  return {
    byCategory: buildCountMap(CATEGORIES, facets.byCategory),
    byPriority: buildCountMap(PRIORITIES, facets.byPriority),
    byStatus: buildCountMap(STATUSES, facets.byStatus),
    reviewedCount: reviewed.count,
    modelAgreementRate,
  };
};
