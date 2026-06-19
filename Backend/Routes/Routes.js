import express from "express";
import roadBoundController from "../Controller/roadBoundController.js";
const router=express.Router();
router.post("/api/saveRider",roadBoundController.saveRider);
router.post("/api/checkRider",roadBoundController.checkRider);
router.get("/api/getCommunityList/:email",roadBoundController.getCommunityList);
router.post("/api/saveCommunity",roadBoundController.saveCommunity);
export default router;