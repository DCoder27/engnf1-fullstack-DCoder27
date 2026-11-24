import mongoose from "mongoose";

import Ticket from "../models/Ticket.js";
import TicketEvent from "../models/TicketEvent.js";
import User from "../models/User.js";
import { HttpError } from "../utils/HttpError.js";

const REVIEWABLE_FIELDS = ["category", "priority", "status", "assigneeId"];

const serializeValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  return value.toString();
};

export const reviewTicket = async ({ ticketId, updates, actor }) => {
  const session = await mongoose.startSession();
  let updatedTicket;

  try {
    await session.withTransaction(async () => {
      const ticket = await Ticket.findById(ticketId).session(session);

      if (!ticket) {
        throw new HttpError(404, "NOT_FOUND", "Ticket not found");
      }

      if (updates.assigneeId) {
        const assigneeExists = await User.exists({
          _id: updates.assigneeId,
        }).session(session);

        if (!assigneeExists) {
          throw new HttpError(404, "NOT_FOUND", "Assignee not found");
        }
      }

      const events = [];
      const originalStatus = ticket.status;

      for (const field of REVIEWABLE_FIELDS) {
        if (!(field in updates)) {
          continue;
        }

        const oldValue = serializeValue(ticket[field]);
        const newValue = serializeValue(updates[field]);

        if (oldValue === newValue) {
          continue;
        }

        ticket[field] = updates[field];
        events.push({
          ticketId: ticket._id,
          field,
          oldValue,
          newValue,
          actor,
        });
      }

      const categoryChanged = events.some(
        (event) => event.field === "category",
      );
      const transitionedFromOpen = events.some(
        (event) => event.field === "status" && originalStatus === "OPEN",
      );

      if (categoryChanged) {
        ticket.isHumanOverride = true;
      }

      if (categoryChanged || transitionedFromOpen) {
        ticket.isReviewed = true;
      }

      if (events.length > 0) {
        await ticket.save({ session });
        await TicketEvent.insertMany(events, { session });
      }

      updatedTicket = ticket;
    });
  } finally {
    await session.endSession();
  }

  const ticketEvents = await TicketEvent.find({ ticketId }).sort({
    createdAt: 1,
    _id: 1,
  });

  return {
    ticket: updatedTicket,
    ticket_events: ticketEvents,
  };
};
