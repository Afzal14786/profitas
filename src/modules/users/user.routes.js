import { Router } from "express";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import * as userController from "./user.controller.js";
import { updateProfileSchema, updateUserSchema, changePasswordSchema } from "./user.validation.js";
import { ROLES } from "../../shared/constants/roles.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// --- self-service ---
router.get("/me", userController.getMe);
router.patch("/me", validate(updateProfileSchema), userController.updateMe);
router.patch("/me/password", validate(changePasswordSchema), userController.changeMyPassword);

// --- admin-only ---
router.get("/", authorize(ROLES.ADMIN), userController.getAllUsers);
router.get("/stats", authorize(ROLES.ADMIN), userController.stats);
router.get("/:id", authorize(ROLES.ADMIN), userController.getUser);
router.patch("/:id", authorize(ROLES.ADMIN), validate(updateUserSchema), userController.updateUser);
router.patch("/:id/activate", authorize(ROLES.ADMIN), userController.activate);
router.delete("/:id", authorize(ROLES.ADMIN), userController.deactivate);


export default router;