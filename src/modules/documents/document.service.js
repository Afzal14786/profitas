import { eq, and, desc, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { documents } from "../../db/schema/documents.schema.js";
import { properties } from "../../db/schema/properties.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";
import { hasRoleInOrg } from "../../shared/utils/org-access.js";
import { cloudinary } from "../../config/cloudinary.js";

/* ----------------------------- helpers ----------------------------- */

async function getPropertyOrFail(propertyId) {
  const [row] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId));
  if (!row)
    throw new AppError("Property not found", 404, ERROR_CODES.NOT_FOUND);
  return row;
}

async function canManageProperty(property, requester) {
  if (requester.role === "admin") return true;
  if (property.organizationId) {
    return hasRoleInOrg(property.organizationId, requester.id, [
      "owner",
      "admin",
    ]);
  }
  return property.ownerUserId === requester.id;
}

/* ----------------------------- create ----------------------------- */

export async function createDocument(requester, file, body) {
  if (!file) {
    throw new AppError("No file uploaded", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const property = await getPropertyOrFail(body.propertyId);
  const allowed = await canManageProperty(property, requester);
  if (!allowed) {
    throw new AppError(
      "You do not have permission to upload documents for this property",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const [created] = await db
    .insert(documents)
    .values({
      propertyId: body.propertyId,
      uploadedBy: requester.id,
      documentType: body.documentType,
      fileName: file.originalname || body.fileName || "unnamed",
      cloudinaryPublicId: file.filename,
      cloudinaryUrl: file.path,
      cloudinaryFormat: file.format || null,
      cloudinaryBytes: file.size || null,
      status: "pending",
    })
    .returning();

  return created;
}

/* ----------------------------- read ----------------------------- */

export async function listDocuments({
  propertyId,
  documentType,
  status,
  page,
  limit,
}) {
  const conditions = [];
  if (propertyId) conditions.push(eq(documents.propertyId, propertyId));
  if (documentType) conditions.push(eq(documents.documentType, documentType));
  if (status) conditions.push(eq(documents.status, status));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(documents)
    .where(where)
    .orderBy(desc(documents.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(documents)
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getDocumentById(id) {
  const [row] = await db.select().from(documents).where(eq(documents.id, id));
  if (!row)
    throw new AppError("Document not found", 404, ERROR_CODES.NOT_FOUND);
  return row;
}

/* ----------------------------- delete ----------------------------- */

export async function deleteDocument(id, requester) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (!doc)
    throw new AppError("Document not found", 404, ERROR_CODES.NOT_FOUND);

  if (requester.role !== "admin" && doc.uploadedBy !== requester.id) {
    throw new AppError(
      "Only the uploader or admin can delete this document",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  // Best-effort Cloudinary removal — don't block DB delete on this
  try {
    await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
      resource_type: "auto",
    });
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message);
  }

  await db.delete(documents).where(eq(documents.id, id));
  return { message: "Document deleted" };
}
