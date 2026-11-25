import Resource from "../models/Resource.js";
import { HttpError } from "../utils/HttpError.js";
import { escapeRegex } from "../utils/search.js";

const PAGE_SIZE = 10;
const CASE_INSENSITIVE_COLLATION = { locale: "en", strength: 2 };

const normalizeDescription = (description) => {
  return description === "" ? null : description;
};

const convertDuplicateNameError = (error) => {
  if (error?.code === 11000) {
    throw new HttpError(409, "CONFLICT", "A resource with this name already exists");
  }

  throw error;
};

export const listResources = async ({ query, role }) => {
  const { search, type, minCapacity, page } = query;
  const filter = {};

  if (role !== "ADMIN") {
    filter.isActive = true;
  }

  if (type) {
    filter.type = type;
  }

  if (minCapacity) {
    filter.capacity = { $gte: minCapacity };
  }

  if (search) {
    filter.name = new RegExp(escapeRegex(search), "i");
  }

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .collation(CASE_INSENSITIVE_COLLATION)
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
    Resource.countDocuments(filter).collation(CASE_INSENSITIVE_COLLATION),
  ]);

  return {
    data: resources,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

export const getResourceById = async ({ resourceId, role }) => {
  const filter = { _id: resourceId };

  if (role !== "ADMIN") {
    filter.isActive = true;
  }

  return Resource.findOne(filter);
};

export const createResource = async (input) => {
  try {
    return await Resource.create({
      ...input,
      description: normalizeDescription(input.description ?? null),
    });
  } catch (error) {
    return convertDuplicateNameError(error);
  }
};

export const updateResource = async (resourceId, updates) => {
  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new HttpError(404, "NOT_FOUND", "Resource not found");
  }

  for (const [field, value] of Object.entries(updates)) {
    resource[field] =
      field === "description" ? normalizeDescription(value) : value;
  }

  try {
    return await resource.save();
  } catch (error) {
    return convertDuplicateNameError(error);
  }
};
