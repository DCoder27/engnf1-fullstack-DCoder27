import mongoose from "mongoose";

import { importTickets } from "../services/ticketImportService.js";
import {
  getTicketWithEvents,
  listTickets,
} from "../services/ticketQueryService.js";

export const importTicketFeed = async (req, res, next) => {
  try {
    const result = await importTickets(req.body.tickets);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const result = await listTickets(req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Ticket not found",
        },
      });
    }

    const result = await getTicketWithEvents(id);

    if (!result) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Ticket not found",
        },
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
