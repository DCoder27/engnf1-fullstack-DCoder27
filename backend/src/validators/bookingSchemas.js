import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "ID must be a valid MongoDB ObjectId");

const utcDateTimeSchema = z
  .string()
  .datetime({ offset: false, message: "Timestamp must be ISO 8601 UTC" })
  .transform((value) => new Date(value));

export const createBookingSchema = z
  .object({
    resourceId: objectIdSchema,
    startTime: utcDateTimeSchema,
    endTime: utcDateTimeSchema,
    purpose: z
      .string()
      .trim()
      .min(5, "Purpose must contain at least 5 characters")
      .max(200, "Purpose must not exceed 200 characters"),
    ticketId: z.union([objectIdSchema, z.null()]).optional(),
  })
  .strict();

export const myBookingsQuerySchema = z
  .object({
    status: z
      .enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"])
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
  })
  .strict();

export const adminBookingsQuerySchema = z
  .object({
    status: z
      .enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"])
      .optional(),
    resourceId: objectIdSchema.optional(),
    from: utcDateTimeSchema.optional(),
    to: utcDateTimeSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
  })
  .strict()
  .superRefine(({ from, to }, context) => {
    if (Boolean(from) !== Boolean(to)) {
      context.addIssue({
        code: "custom",
        message: "from and to must be provided together",
      });
      return;
    }

    if (from instanceof Date && to instanceof Date && to <= from) {
      context.addIssue({
        code: "custom",
        path: ["to"],
        message: "to must be later than from",
      });
    }
  });
