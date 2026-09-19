import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import {HTTP_STATUS} from "../../shared/constants/http-status.js";
import * as svc from "./dashboard.service.js";

export const summary = asyncHandler(async (req, res) => {
  const data = await svc.getSummary();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Dashboard summary"));
});

export const properties = asyncHandler(async (req, res) => {
  const data = await svc.getDashboardProperties();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Dashboard properties"));
});
