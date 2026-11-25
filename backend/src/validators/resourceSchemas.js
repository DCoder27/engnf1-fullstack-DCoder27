import { z } from "zod";

const resourceNameSchema = z
  .string()
  .trim()
  .min(3, "Name must contain at least 3 characters")
  .max(60, "Name must not exceed 60 characters");

const resourceTypeSchema = z.enum(["ROOM", "LAB", "EQUIPMENT"]);

const capacitySchema = z
  .number()
  .int("Capacity must be an integer")
  .min(1, "Capacity must be at least 1")
  .max(500, "Capacity must not exceed 500");

const descriptionSchema = z
  .string()
  .trim()
  .max(300, "Description must not exceed 300 characters")
  .nullable();

export const resourceListQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .max(100, "Search must not exceed 100 characters")
      .optional(),
    type: resourceTypeSchema.optional(),
    minCapacity: z.coerce.number().int().min(1).max(500).optional(),
    page: z.coerce.number().int().min(1).default(1),
  })
  .strict();

export const createResourceSchema = z
  .object({
    name: resourceNameSchema,
    type: resourceTypeSchema,
    capacity: capacitySchema,
    description: descriptionSchema.optional(),
  })
  .strict();

export const updateResourceSchema = z
  .object({
    name: resourceNameSchema.optional(),
    type: resourceTypeSchema.optional(),
    capacity: capacitySchema.optional(),
    description: descriptionSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one resource field is required",
  });
