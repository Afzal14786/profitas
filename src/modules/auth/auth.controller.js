import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(new ApiResponse(201, result, "Registration successful"));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  res.status(200).json(new ApiResponse(200, result, "Token refreshed"));
});