import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { clearQuickBoard, getQuickBoard, saveQuickBoardStroke } from "../controller/quickBoardController.js";

const router = express.Router();

router.use(protectRoute);
router.get("/:peerId", getQuickBoard);
router.post("/:peerId/strokes", saveQuickBoardStroke);
router.delete("/:peerId", clearQuickBoard);

export default router;
