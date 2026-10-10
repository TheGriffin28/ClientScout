import express from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserLimits,
  getAIUsageStats,
  getConfigs,
  updateConfig,
  getAdminLogs,
  getDashboardCharts,
  uploadQRCode,
  getTransactions,
  updateTransactionStatus
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'upi-qr-code' + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed!"));
  }
});

// All routes here are protected and require admin role
router.use(protect);
router.use(admin);

router.post("/upload-qr", upload.single('qrCode'), uploadQRCode);
router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/limits", updateUserLimits);
router.get("/ai-usage", getAIUsageStats);
router.get("/charts", getDashboardCharts);
router.get("/config", getConfigs);
router.patch("/config/:key", updateConfig);
router.get("/logs", getAdminLogs);
router.get("/transactions", getTransactions);
router.put("/transactions/:id/status", updateTransactionStatus);

export default router;
