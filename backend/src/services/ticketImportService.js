import Ticket from "../models/Ticket.js";
import { classifyTicket } from "../utils/triage.js";

const updateExistingTicket = async (ticket, incoming, counters) => {
  const textChanged =
    ticket.subject !== incoming.subject || ticket.body !== incoming.body;

  if (ticket.isHumanOverride) {
    counters.skippedOverrideCount += 1;

    if (textChanged) {
      ticket.subject = incoming.subject;
      ticket.body = incoming.body;
      await ticket.save();
      counters.updatedCount += 1;
    }

    return;
  }

  const classification = classifyTicket(incoming.subject, incoming.body);
  const classificationChanged =
    ticket.autoCategory !== classification.autoCategory ||
    ticket.category !== classification.category ||
    ticket.priority !== classification.priority;

  if (!textChanged && !classificationChanged) {
    return;
  }

  ticket.subject = incoming.subject;
  ticket.body = incoming.body;
  ticket.autoCategory = classification.autoCategory;
  ticket.category = classification.category;
  ticket.priority = classification.priority;

  await ticket.save();
  counters.updatedCount += 1;
};

export const importTickets = async (incomingTickets) => {
  const counters = {
    importedCount: 0,
    updatedCount: 0,
    skippedOverrideCount: 0,
    total: incomingTickets.length,
  };

  for (const incoming of incomingTickets) {
    let ticket = await Ticket.findOne({ externalId: incoming.externalId });

    if (!ticket) {
      const classification = classifyTicket(incoming.subject, incoming.body);

      try {
        await Ticket.create({
          ...incoming,
          ...classification,
        });
        counters.importedCount += 1;
        continue;
      } catch (error) {
        if (error?.code !== 11000) {
          throw error;
        }

        ticket = await Ticket.findOne({ externalId: incoming.externalId });

        if (!ticket) {
          throw error;
        }
      }
    }

    await updateExistingTicket(ticket, incoming, counters);
  }

  return counters;
};
