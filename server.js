require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const emailRoutes = require("./routes/email");

const app = express();

// Production cors settings
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://iquiz-client.replit.app" // Replace with your domain
      : "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Middleware
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type']
// }));

// Serve static files in production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
//   });
// }

app.use(express.json());

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// Routes
app.use(emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    "MAILCHIMP_API_KEY:",
    process.env.MAILCHIMP_API_KEY ? "Is set" : "Not set",
  );
});
