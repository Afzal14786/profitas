import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import * as ctrl from "./dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/summary", ctrl.summary);
router.get("/properties", ctrl.properties);

export default router;
