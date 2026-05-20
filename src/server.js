const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models");
const routes = require("./routes");

const connectDB = require("./config/db");

dotenv.config();

const app = express();
const port = process.env.PORT || 5620;

const allowedOrigins = [
  "http://localhost:5173",   // Vite dev server (admin frontend)
  "http://localhost:5174",   // Vite alternate port
  "http://localhost:3000",   // Create-react-app fallback
  "https://charity-backend-gcnw.onrender.com", // Old render frontend (if needed)
  "https://charity-c2sz96l6d-jts-projects-0424a64c.vercel.app" // Vercel frontend
];

const path = require("path");

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// Base welcome route for status/hosting checks
app.get("/", (req, res) => {
  res.status(200).json({
    status: "active",
    message: "Charity ERP Backend API is fully operational and running!",
    timestamp: new Date()
  });
});

// API routes
app.use("/api", routes);

// Connect to MongoDB & Start Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 New Backend running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error("❌ Failed to launch new backend due to connection error:", err);
});
// Nodemon refresh trigger
