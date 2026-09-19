import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(201, result, "Registration successful"));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Login successful"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Token refreshed"));
});