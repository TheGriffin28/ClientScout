import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";


dotenv.config();
connectDB();

const app = express();

/* ✅ BODY PARSER (THIS FIXES YOUR ISSUE) */
app.use(express.json());

app.use(cookieParser());
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
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
app.use((req, res, next) => {
  console.log("HEADERS:", req.headers["content-type"]);
  console.log("BODY:", req.body);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);


app.get("/", (req, res) => {
  res.send("ClientScout API running 🚀");
});

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});
