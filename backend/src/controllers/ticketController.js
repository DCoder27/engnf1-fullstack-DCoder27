import { importTickets } from "../services/ticketImportService.js";

export const importTicketFeed = async (req, res, next) => {
  try {
    const result = await importTickets(req.body.tickets);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
