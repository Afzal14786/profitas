import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import {HTTP_STATUS} from "../../shared/constants/http-status.js";
import * as partnerService from "./partner.service.js";

export const create = asyncHandler(async (req, res) => {
  const p = await partnerService.createPartner(req.body);
  res.status(201).json(new ApiResponse(HTTP_STATUS.CREATED, p, "Partner created"));
});

export const list = asyncHandler(async (req, res) => {
  const result = await partnerService.listPartners(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Partners retrieved"));
});

export const getOne = asyncHandler(async (req, res) => {
  const p = await partnerService.getPartnerById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, p, "Partner retrieved"));
});

export const update = asyncHandler(async (req, res) => {
  const p = await partnerService.updatePartner(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, p, "Partner updated"));
});

export const remove = asyncHandler(async (req, res) => {
  const p = await partnerService.deactivatePartner(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, p, "Partner deactivated"));
});
