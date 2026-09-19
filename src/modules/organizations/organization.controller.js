import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import * as orgService from "./organization.service.js";

export const create = asyncHandler(async (req, res) => {
  const org = await orgService.createOrganization(req.user.id, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, org, "Organization created successfully"));
});

export const listAll = asyncHandler(async (req, res) => {
  const result = await orgService.listOrganizations(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Organizations retrieved"));
});

export const listMine = asyncHandler(async (req, res) => {
  const rows = await orgService.listMyOrganizations(req.user.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, rows, "My organizations retrieved"));
});

export const getOne = asyncHandler(async (req, res) => {
  const org = await orgService.getOrganizationById(req.params.id, req.user);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, org, "Organization retrieved"));
});

export const update = asyncHandler(async (req, res) => {
  const updated = await orgService.updateOrganization(
    req.params.id,
    req.user,
    req.body,
  );
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, "Organization updated"));
});

export const addMember = asyncHandler(async (req, res) => {
  const member = await orgService.addMember(req.params.id, req.user, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, member, "Member added"));
});

export const listMembers = asyncHandler(async (req, res) => {
  const members = await orgService.listMembers(req.params.id, req.user);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, members, "Members retrieved"));
});

export const removeMember = asyncHandler(async (req, res) => {
  const result = await orgService.removeMember(
    req.params.id,
    req.user,
    req.params.userId,
  );
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Member removed"));
});
