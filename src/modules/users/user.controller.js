import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import * as userService from "./user.service.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.status(200).json(new ApiResponse(200, user, "Profile retrieved"));
});

export const updateMe = asyncHandler(async (req, res) => {
  const updated = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json(new ApiResponse(200, updated, "Profile updated"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.status(200).json(new ApiResponse(200, users, "Users retrieved"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserById(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, updated, "User updated"));
});

export const deactivate = asyncHandler(async (req, res) => {
  const updated = await userService.deactivateUser(req.params.id);
  res.status(200).json(new ApiResponse(200, updated, "User deactivated"));
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, "User retrieved"));
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const result = await userService.changePassword(req.user.id, req.body);
  res.status(200).json(new ApiResponse(200, result, "Password changed"));
});

export const activate = asyncHandler(async (req, res) => {
  const updated = await userService.activateUser(req.params.id);
  res.status(200).json(new ApiResponse(200, updated, "User activated"));
});

export const stats = asyncHandler(async (req, res) => {
  const data = await userService.getUserStats();
  res.status(200).json(new ApiResponse(200, data, "User stats retrieved"));
});