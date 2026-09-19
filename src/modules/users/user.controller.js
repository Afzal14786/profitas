import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import * as userService from "./user.service.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, user, "Profile retrieved"));
});

export const updateMe = asyncHandler(async (req, res) => {
  const updated = await userService.updateProfile(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, "Profile updated"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, users, "Users retrieved"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserById(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, "User updated"));
});

export const deactivate = asyncHandler(async (req, res) => {
  const updated = await userService.deactivateUser(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, "User deactivated"));
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, user, "User retrieved"));
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const result = await userService.changePassword(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Password changed"));
});

export const activate = asyncHandler(async (req, res) => {
  const updated = await userService.activateUser(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, "User activated"));
});

export const stats = asyncHandler(async (req, res) => {
  const data = await userService.getUserStats();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "User stats retrieved"));
});