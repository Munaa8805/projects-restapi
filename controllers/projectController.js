import Project from '../models/Project.js';

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_FIELDS = ['createdAt', 'updatedAt', 'date', 'title', 'category'];

const parseSort = (sortParam) => {
    const raw = typeof sortParam === 'string' && sortParam.trim() ? sortParam.trim() : '-createdAt';
    const dir = raw.startsWith('-') ? -1 : 1;
    const field = raw.replace(/^-/, '');
    if (!SORT_FIELDS.includes(field)) {
        return { createdAt: -1 };
    }
    return { [field]: dir };
};

const getProjects = async (req, res) => {
    try {
        const { page, limit, category, featured, search, sort } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};

        if (category !== undefined && String(category).trim() !== '') {
            filter.category = new RegExp(escapeRegex(String(category).trim()), 'i');
        }

        if (featured !== undefined && featured !== '' && featured !== null) {
            if (featured === 'true' || featured === true) {
                filter.featured = true;
            } else if (featured === 'false' || featured === false) {
                filter.featured = false;
            }
        }

        if (search !== undefined && String(search).trim() !== '') {
            const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
            filter.$or = [{ title: rx }, { description: rx }];
        }

        const sortObj = parseSort(sort);

        const [projects, total] = await Promise.all([
            Project.find(filter).sort(sortObj).skip(skip).limit(limitNum),
            Project.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limitNum) || 1;
        const prevPage = pageNum > 1 ? pageNum - 1 : null;
        const nextPage = pageNum < totalPages ? pageNum + 1 : null;

        res.status(200).json({
            success: true,
            data: projects,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasMore: pageNum < totalPages,
                prevPage,
                nextPage,
            },
        });
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