const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: "./server/.env" });

const donorRoutes = require("./routes/donorRoutes");
const requestRoutes = require("./routes/requestRoutes");
const Donor = require("./models/Donor");
const Request = require("./models/Request");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5501",
  "https://nationalclub-blood-support.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("NATIONAL ARTS & SPORTS CLUB Blood Support API Running");
});

app.use("/donor", donorRoutes);
app.use("/request", requestRoutes);

// Admin stats API
app.get("/admin/stats", async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const availableDonors = await Donor.countDocuments({ available: true });
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: "Pending" });
    const completedRequests = await Request.countDocuments({ status: "Completed" });

    res.json({
      totalDonors,
      availableDonors,
      totalRequests,
      pendingRequests,
      completedRequests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load admin stats",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });