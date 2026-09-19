import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../../config/cloudinary.js";
import { env } from "../../config/env.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const propertyId = req.body.propertyId || req.params.propertyId || "unassigned";
    return {
      folder: `${env.CLOUDINARY_FOLDER}/${propertyId}`,
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
    };
  },
});

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
]);

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Unsupported file type. Only PDF, JPG, PNG allowed."));
    }
    cb(null, true);
  },
});