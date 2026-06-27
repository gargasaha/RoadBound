import express from "express";
import roadBoundController from "../Controller/roadBoundController.js";
const router=express.Router();
router.post("/api/saveRider",roadBoundController.saveRider);
router.post("/api/checkRider",roadBoundController.checkRider);
router.get("/api/getCommunityList/:email",roadBoundController.getCommunityList);
router.get("/api/searchCommunityList/:email/:keyword",roadBoundController.searchCommunityList);
router.post("/api/saveCommunity",roadBoundController.saveCommunity);
router.post("/api/joinCommunity",roadBoundController.joinCommunity);

export default router;