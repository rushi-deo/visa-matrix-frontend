import express from 'express';
import { getCountriesHandler } from '../controllers/countriesController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/countries
router.get('/countries', asyncHandler(getCountriesHandler));

export default router;
