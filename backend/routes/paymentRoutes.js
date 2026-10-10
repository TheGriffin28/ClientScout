import express from "express";
import { purchaseCredits, getPaymentConfig } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/config", protect, getPaymentConfig);
router.post("/purchase", protect, purchaseCredits);

export default router;
