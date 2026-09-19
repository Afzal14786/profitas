import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import {HTTP_STATUS} from "../../shared/constants/http-status.js";

import * as svc from "./document.service.js";

export const create = asyncHandler(async (req, res) => {
  const doc = await svc.createDocument(req.user, req.file, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, doc, "Document uploaded"));
});

export const list = asyncHandler(async (req, res) => {
  const result = await svc.listDocuments(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Documents retrieved"));
});

export const getOne = asyncHandler(async (req, res) => {
  const doc = await svc.getDocumentById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, doc, "Document retrieved"));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await svc.deleteDocument(req.params.id, req.user);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Document deleted"));
});
