import express from 'express';
import { getCountriesHandler } from '../controllers/countriesController.js';
import { getCountryQuestionsHandler } from '../controllers/visaQuestionsController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/countries
router.get('/countries', asyncHandler(getCountriesHandler));

// GET /api/countries/:countryId/questions
router.get('/countries/:countryId/questions', asyncHandler(getCountryQuestionsHandler));

export default router;
