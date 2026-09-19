import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import {HTTP_STATUS} from "../../shared/constants/http-status.js"
import * as svc from "./verification.service.js";

export const create = asyncHandler(async (req, res) => {
  const v = await svc.createVerification(req.user, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, v, "Verification created"));
});

export const list = asyncHandler(async (req, res) => {
  const result = await svc.listVerifications(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Verifications retrieved"));
});

export const getOne = asyncHandler(async (req, res) => {
  const v = await svc.getVerificationById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, v, "Verification retrieved"));
});

export const update = asyncHandler(async (req, res) => {
  const v = await svc.updateVerification(req.params.id, req.user, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, v, "Verification updated"));
});
