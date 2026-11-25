import { Router } from "express";

import { getAnalytics } from "../controllers/adminStatsController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", authenticate, requireAdmin, getAnalytics);

export default router;
