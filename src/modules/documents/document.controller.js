import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import * as svc from "./document.service.js";

export const create = asyncHandler(async (req, res) => {
  const doc = await svc.createDocument(req.user, req.file, req.body);
  res.status(201).json(new ApiResponse(201, doc, "Document uploaded"));
});

export const list = asyncHandler(async (req, res) => {
  const result = await svc.listDocuments(req.query);
  res.status(200).json(new ApiResponse(200, result, "Documents retrieved"));
});

export const getOne = asyncHandler(async (req, res) => {
  const doc = await svc.getDocumentById(req.params.id);
  res.status(200).json(new ApiResponse(200, doc, "Document retrieved"));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await svc.deleteDocument(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, result, "Document deleted"));
});
