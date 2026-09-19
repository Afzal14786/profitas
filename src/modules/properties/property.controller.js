import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import * as propertyService from "./property.service.js";

export const create = asyncHandler(async (req, res) => {
  const property = await propertyService.createProperty(req.user, req.body);
  res
    .status(201)
    .json(new ApiResponse(201, property, "Property created successfully"));
});

export const list = asyncHandler(async (req, res) => {
  const result = await propertyService.listProperties(req.query);
  res.status(200).json(new ApiResponse(200, result, "Properties retrieved"));
});

export const getOne = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);
  res.status(200).json(new ApiResponse(200, property, "Property retrieved"));
});

export const update = asyncHandler(async (req, res) => {
  const updated = await propertyService.updateProperty(
    req.params.id,
    req.user,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, updated, "Property updated"));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const updated = await propertyService.updatePropertyStatus(
    req.params.id,
    req.user,
    req.body,
  );
  res
    .status(200)
    .json(new ApiResponse(200, updated, "Property status updated"));
});

export const archive = asyncHandler(async (req, res) => {
  const archived = await propertyService.archiveProperty(
    req.params.id,
    req.user,
  );
  res.status(200).json(new ApiResponse(200, archived, "Property archived"));
});
