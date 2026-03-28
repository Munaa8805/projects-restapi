import express from 'express';
import { getIdeas, getIdeaById, createIdea, updateIdea, deleteIdea, featuredIdeas } from '../controllers/ideaController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getIdeas);
router.get('/:id', getIdeaById);
router.post('/', protect, createIdea);
router.put('/:id', protect, updateIdea);
router.delete('/:id', protect, deleteIdea);
router.get('/featured', featuredIdeas);
export default router;