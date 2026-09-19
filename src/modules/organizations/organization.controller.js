import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import * as orgService from "./organization.service.js";

export const create = asyncHandler(async (req, res) => {
  const org = await orgService.createOrganization(req.user.id, req.body);
  res
    .status(201)
    .json(new ApiResponse(201, org, "Organization created successfully"));
});

export const listAll = asyncHandler(async (req, res) => {
  const result = await orgService.listOrganizations(req.query);
  res.status(200).json(new ApiResponse(200, result, "Organizations retrieved"));
});

export const listMine = asyncHandler(async (req, res) => {
  const rows = await orgService.listMyOrganizations(req.user.id);
  res
    .status(200)
    .json(new ApiResponse(200, rows, "My organizations retrieved"));
});

export const getOne = asyncHandler(async (req, res) => {
  const org = await orgService.getOrganizationById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, org, "Organization retrieved"));
});

export const update = asyncHandler(async (req, res) => {
  const updated = await orgService.updateOrganization(
    req.params.id,
    req.user,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, updated, "Organization updated"));
});

export const addMember = asyncHandler(async (req, res) => {
  const member = await orgService.addMember(req.params.id, req.user, req.body);
  res.status(201).json(new ApiResponse(201, member, "Member added"));
});

export const listMembers = asyncHandler(async (req, res) => {
  const members = await orgService.listMembers(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, members, "Members retrieved"));
});

export const removeMember = asyncHandler(async (req, res) => {
  const result = await orgService.removeMember(
    req.params.id,
    req.user,
    req.params.userId,
  );
  res.status(200).json(new ApiResponse(200, result, "Member removed"));
});
