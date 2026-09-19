import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { upload } from "../../shared/middleware/upload.middleware.js";
import * as ctrl from "./document.controller.js";
import {
  createDocumentSchema,
  listDocumentsQuerySchema,
  uuidParamSchema,
} from "./document.validation.js";

const router = Router();

router.use(authenticate);

// Multipart upload — multer parses body BEFORE validate() runs
router.post(
  "/",
  upload.single("file"),
  validate(createDocumentSchema),
  ctrl.create,
);

router.get("/", validate(listDocumentsQuerySchema, "query"), ctrl.list);

router.get("/:id", validate(uuidParamSchema, "params"), ctrl.getOne);

router.delete("/:id", validate(uuidParamSchema, "params"), ctrl.remove);

export default router;
