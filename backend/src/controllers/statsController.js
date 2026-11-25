import { getTicketStats } from "../services/ticketStatsService.js";

export const getStats = async (req, res, next) => {
  try {
    const stats = await getTicketStats();
    return res.status(200).json(stats);
  } catch (error) {
    return next(error);
  }
};
