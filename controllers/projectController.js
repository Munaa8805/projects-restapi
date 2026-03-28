import Project from '../models/Project.js';

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        throw new Error(`Failed to get projects: ${error.message}`, 500);
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            throw new Error('Project not found', 404);
        }
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        throw new Error(`Failed to get project by id: ${error.message}`, 500);
    }
};

export { getProjects, getProjectById };