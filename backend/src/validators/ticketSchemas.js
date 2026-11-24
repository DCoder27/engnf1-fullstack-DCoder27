import { z } from "zod";

const importedTicketSchema = z
  .object({
    externalId: z.string().trim().min(1, "externalId is required"),
    subject: z
      .string()
      .trim()
      .min(3, "Subject must contain at least 3 characters")
      .max(150, "Subject must not exceed 150 characters"),
    body: z
      .string()
      .trim()
      .min(5, "Body must contain at least 5 characters")
      .max(2000, "Body must not exceed 2000 characters"),
  })
  .strict();

export const ticketImportSchema = z
  .object({
    tickets: z
      .array(importedTicketSchema)
      .min(1, "At least one ticket is required"),
  })
  .strict()
  .superRefine(({ tickets }, context) => {
    const seen = new Set();

    tickets.forEach((ticket, index) => {
      if (seen.has(ticket.externalId)) {
        context.addIssue({
          code: "custom",
          path: ["tickets", index, "externalId"],
          message: "externalId values must be unique within an import",
        });
      }

      seen.add(ticket.externalId);
    });
  });

export const ticketListQuerySchema = z
  .object({
    status: z
      .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
      .optional(),
    category: z
      .enum(["BILLING", "BUG", "FEATURE_REQUEST", "LOGIN", "DELIVERY"])
      .optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    q: z.string().trim().max(200, "Search must not exceed 200 characters").optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();
