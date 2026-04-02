import express from 'express';
import { getCountries, getCountryById } from '../controllers/countriesController.js';

const router = express.Router();

router.get('/', getCountries);
router.get('/:id', getCountryById);
export default router;