import 'dotenv/config'
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import countriesRoutes from "./routes/countriesRoutes.js";
import applicationsRoutes from "./routes/applicationsRoutes.js";
import accessControlRoutes from "./routes/accessControlRoutes.js";
import invoicesRoutes from "./routes/invoicesRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import hrRoutes from "./modules/hr/index.js";
import enterpriseHrRoutes from "./src/services/hr/index.js";
import { getSupabaseConfigStatus } from "./config/supabaseClient.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", countriesRoutes);
app.use("/api", applicationsRoutes);
app.use("/api", accessControlRoutes);
app.use("/api", invoicesRoutes);
app.use("/api", searchRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/v1/hr", enterpriseHrRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log("Supabase startup status:", getSupabaseConfigStatus());
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }

  console.error("Server error:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export default app;
