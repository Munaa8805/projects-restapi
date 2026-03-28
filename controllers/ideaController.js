import Idea from '../models/Idea.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
const getIdeas = async (req, res) => {
    try {
        const ideas = await Idea.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: ideas });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to get ideas: ${error.message}`);
    }
};

const featuredIdeas = async (req, res) => {
    try {
        const ideas = await Idea.find({ featured: true });
        res.status(200).json({ success: true, data: ideas });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to get featured ideas: ${error.message}`);
    }
};

const getIdeaById = async (req, res) => {
    try {
        const id = mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null;
        if (!id) {
            res.status(400);
            throw new Error('Invalid idea id');
        }
        const idea = await Idea.findById(id).populate('user', 'name');
        if (!idea) {
            res.status(404);
            throw new Error('Idea not found, id: ' + id);
        }
        res.status(200).json({ success: true, data: idea });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to get idea by id: ${error.message}`);
    }
};

const createIdea = async (req, res) => {
    try {
        const { title, description, summary, tags, featured } = req.body || {};
        if (!title.trim() || !description.trim() || !summary.trim() || !tags.trim()) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        // console.log("req.user.id", req.user);
        const newIdea = new Idea({
            title,
            description,
            summary,
            tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [],
            user: req.user._id.toString(),
            featured: featured || false,
        })
        const idea = await newIdea.save();
        res.status(201).json({ success: true, data: idea });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to create idea: ${error.message}`);
    }
};

const updateIdea = async (req, res) => {
    try {
        const { title, description, summary, tags, featured } = req.body || {};
        // if (!title || !description || !summary || !tags) {
        //     return res.status(400).json({ success: false, message: 'Please add all fields' });
        // }
        let idea = await Idea.findById(req.params.id);
        if (!idea) {
            res.status(404);
            throw new Error('Idea not found, id: ' + req.params.id);
        }
        if (idea.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this idea');
        }
        idea.title = title || idea.title;
        idea.description = description || idea.description;
        idea.summary = summary || idea.summary;
        idea.tags = tags || idea.tags;
        idea.featured = featured || idea.featured;
        await idea.save();

        res.status(200).json({ success: true, data: idea });
    } catch (error) {
        throw new Error(`Failed to update idea: ${error.message}`, 500);
    }
};

const deleteIdea = async (req, res) => {
    try {

        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            throw new Error('Idea not found', 404);
        }

        if (idea.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this idea');
        }
        await idea.remove();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        throw new Error(`Failed to delete idea: ${error.message}`, 500);
    }
};

export { getIdeas, getIdeaById, createIdea, updateIdea, deleteIdea, featuredIdeas };