import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import movieRoutes from "./routes/movieRoutes.js";
import authRoutes from './routes/authRoutes.js';

// .env file se variables load karne ke liye
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // JSON data read karne ke liye
app.use("/api/movies", movieRoutes); // Movie related routes handle karne ke liye
app.use('/api/users', authRoutes);// Authentication related routes handle karne ke liye

// Test Route
app.get("/", (req, res) => {
  res.send("CineMetrics API is running! 🎬");
});

// Database Connection & Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🔥 MongoDB Connected Successfully!");
    app.listen(PORT, () => { // Server start kar rahe hain
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to the database:", err);
    process.exit(1);
  });