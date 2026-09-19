import { asyncHandler } from "../../shared/utils/async-handler.js";
import { ApiResponse } from "../../shared/utils/api-response.js";
import {HTTP_STATUS} from "../../shared/constants/http-status.js";
import * as svc from "./liquidity.service.js";

/* ---------------- requests ---------------- */

export const createRequest = asyncHandler(async (req, res) => {
  const r = await svc.createLiquidityRequest(req.user, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, r, "Liquidity request created"));
});

export const listRequests = asyncHandler(async (req, res) => {
  const r = await svc.listLiquidityRequests(req.query, req.user);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Liquidity requests retrieved"));
});

export const getRequest = asyncHandler(async (req, res) => {
  const r = await svc.getLiquidityRequestById(req.params.id, req.user);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Liquidity request retrieved"));
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const r = await svc.updateLiquidityStatus(req.params.id, req.user, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Status updated"));
});

/* ---------------- listings ---------------- */

export const createListing = asyncHandler(async (req, res) => {
  const r = await svc.createListing(req.user, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, r, "Listing created"));
});

export const listListings = asyncHandler(async (req, res) => {
  const r = await svc.listListings(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Listings retrieved"));
});

export const getListing = asyncHandler(async (req, res) => {
  const r = await svc.getListingById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Listing retrieved"));
});

/* ---------------- offers ---------------- */

export const createOffer = asyncHandler(async (req, res) => {
  const r = await svc.createOffer(req.user, req.params.listingId, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, r, "Offer placed"));
});

export const updateOffer = asyncHandler(async (req, res) => {
  const r = await svc.updateOfferStatus(req.params.id, req.user, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Offer updated"));
});

/* ---------------- credit ---------------- */

export const createCredit = asyncHandler(async (req, res) => {
  const r = await svc.createCreditApplication(req.user, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, r, "Credit application created"));
});

export const listCredit = asyncHandler(async (req, res) => {
  const r = await svc.listCreditApplications(req.query, req.user);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, r, "Credit applications retrieved"));
});

export const routeCredit = asyncHandler(async (req, res) => {
  const r = await svc.routeCreditApplication(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Credit application routed"));
});

export const updateCreditStatus = asyncHandler(async (req, res) => {
  const r = await svc.updateCreditStatus(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Credit status updated"));
});


export const listOffersCtrl = asyncHandler(async (req, res) => {
  const r = await svc.listOffersByListing(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, r, "Offers retrieved"));
});