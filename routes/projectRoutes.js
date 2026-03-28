import express from 'express';
import { getProjects, getProjectById, featuredProjects } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/featured', featuredProjects);
router.get('/:id', getProjectById);

export default router;