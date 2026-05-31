import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All notification routes require authentication

router.route("/")
  .get(getNotifications);

router.get("/unread/count", getUnreadCount);

router.put("/:id/read", markAsRead);

router.delete("/:id", deleteNotification);

export default router;
