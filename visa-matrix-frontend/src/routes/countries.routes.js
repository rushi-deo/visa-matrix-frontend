import { Router } from "express";
import { fetchCountries } from "../controllers/countries.controller.js";

const router = Router();

router.get("/", fetchCountries);

export default router;
