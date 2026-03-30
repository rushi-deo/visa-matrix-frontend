import express from "express";
import cors from "cors";
import countriesRoutes from "./routes/countries.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/countries", countriesRoutes);

export default app;
