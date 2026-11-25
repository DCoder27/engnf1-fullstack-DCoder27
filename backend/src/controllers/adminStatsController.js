import { getAdminStats } from "../services/adminStatsService.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const stats = await getAdminStats();
    return res.status(200).json(stats);
  } catch (error) {
    return next(error);
  }
};
