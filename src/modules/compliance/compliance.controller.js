import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import {HTTP_STATUS} from "../../shared/constants/http-status.js";
import * as svc from "./compliance.service.js";

export const create = asyncHandler(async (req, res) => {
  const c = await svc.createCompliance(req.user, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, c, "Compliance record created"));
});

export const list = asyncHandler(async (req, res) => {
  const result = await svc.listCompliance(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Compliance records retrieved"));
});

export const getOne = asyncHandler(async (req, res) => {
  const c = await svc.getComplianceById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, c, "Compliance record retrieved"));
});

export const update = asyncHandler(async (req, res) => {
  const c = await svc.updateCompliance(req.params.id, req.user, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, c, "Compliance record updated"));
});

export const stats = asyncHandler(async (req, res) => {
  const s = await svc.getComplianceStats();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, s, "Compliance stats retrieved"));
});