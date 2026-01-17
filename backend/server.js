import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import { setupCronJobs } from "./cron/followUpCron.js";


dotenv.config();
connectDB();
setupCronJobs();

const app = express();
const PORT = process.env.PORT || 5000;

/* ✅ BODY PARSER (THIS FIXES YOUR ISSUE) */
app.use(express.json());

app.use(cookieParser());
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin === "https://your-vercel-app.vercel.app"
    ) {
      return callback(null, true);
    }
    
    // In production, you can add your actual domain here
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/* DEBUG — KEEP THIS FOR NOW */
//app.use((req, res, next) => {
//  console.log("HEADERS:", req.headers["content-type"]);
//  console.log("BODY:", req.body);
//  next();
//});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.get("/", (req, res) => {
  res.send("ClientScout API running 🚀");
});

/* Catch-all for 404s */
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});


app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
