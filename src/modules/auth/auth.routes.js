import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware.js";
import * as authController from "./auth.controller.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken);

export default router;