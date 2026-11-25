import {
  createResource,
  getResourceById,
  listResources,
  updateResource,
} from "../services/resourceService.js";
import { getResourceAvailability as findResourceAvailability } from "../services/availabilityService.js";

export const getResources = async (req, res, next) => {
  try {
    const result = await listResources({
      query: req.validatedQuery,
      role: req.user.role,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getResource = async (req, res, next) => {
  try {
    const resource = await getResourceById({
      resourceId: req.params.id,
      role: req.user.role,
    });

    if (!resource) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
        },
      });
    }

    return res.status(200).json(resource);
  } catch (error) {
    return next(error);
  }
};

export const addResource = async (req, res, next) => {
  try {
    const resource = await createResource(req.body);
    return res.status(201).json(resource);
  } catch (error) {
    return next(error);
  }
};

export const editResource = async (req, res, next) => {
  try {
    const resource = await updateResource(req.params.id, req.body);
    return res.status(200).json(resource);
  } catch (error) {
    return next(error);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const result = await findResourceAvailability({
      resourceId: req.params.id,
      role: req.user.role,
      from: req.validatedQuery.from,
      to: req.validatedQuery.to,
    });

    if (!result) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
        },
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
