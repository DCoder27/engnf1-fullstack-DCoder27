import Ticket from "../models/Ticket.js";
import TicketEvent from "../models/TicketEvent.js";
import { escapeRegex } from "../utils/search.js";

export const listTickets = async ({
  status,
  category,
  priority,
  q,
  page,
  limit,
}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (q) {
    const safeSearch = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ subject: safeSearch }, { body: safeSearch }];
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  return {
    data: tickets,
    page,
    pageSize: limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getTicketWithEvents = async (ticketId) => {
  const [ticket, ticketEvents] = await Promise.all([
    Ticket.findById(ticketId),
    TicketEvent.find({ ticketId }).sort({ createdAt: 1, _id: 1 }),
  ]);

  if (!ticket) {
    return null;
  }

  return {
    ticket,
    ticket_events: ticketEvents,
  };
};
