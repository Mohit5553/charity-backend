const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models");
const routes = require("./routes");

const connectDB = require("./config/db");

dotenv.config();

const app = express();
const port = process.env.PORT || 5620;

app.use(cors());
app.use(express.json());

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
