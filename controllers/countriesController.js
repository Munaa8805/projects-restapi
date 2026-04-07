import Country from '../models/Country.js';

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_FIELDS = ['createdAt', 'updatedAt', 'area', 'population', 'name.common'];

const parseSort = (sortParam) => {
    const raw = typeof sortParam === 'string' && sortParam.trim() ? sortParam.trim() : 'name.common';
    const dir = raw.startsWith('-') ? -1 : 1;
    const field = raw.replace(/^-/, '');
    if (!SORT_FIELDS.includes(field)) {
        return { 'name.common': 1 };
    }
    return { [field]: dir };
};

const getCountries = async (req, res) => {
    try {
        const {
            page,
            limit,
            continent,
            independent,
            search,
            sort,
            minPopulation,
            maxPopulation,
            minArea,
            maxArea,
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};

        if (continent !== undefined && String(continent).trim() !== '') {
            filter.continents = new RegExp(escapeRegex(String(continent).trim()), 'i');
        }

        if (independent !== undefined && independent !== '' && independent !== null) {
            if (independent === 'true' || independent === true) {
                filter.independent = true;
            } else if (independent === 'false' || independent === false) {
                filter.independent = false;
            }
        }

        if (search !== undefined && String(search).trim() !== '') {
            const pattern = escapeRegex(String(search).trim());
            const rx = { $regex: pattern, $options: 'i' };
            filter.$or = [
                { 'name.common': rx },
                { 'name.official': rx },
                { 'flags.alt': rx },
                { capital: rx },
                { tourist_destinations: rx },
            ];
        }

        const popRange = {};
        if (minPopulation !== undefined && String(minPopulation).trim() !== '') {
            const n = Number(minPopulation);
            if (!Number.isNaN(n)) popRange.$gte = n;
        }
        if (maxPopulation !== undefined && String(maxPopulation).trim() !== '') {
            const n = Number(maxPopulation);
            if (!Number.isNaN(n)) popRange.$lte = n;
        }
        if (Object.keys(popRange).length > 0) {
            filter.population = popRange;
        }

        const areaRange = {};
        if (minArea !== undefined && String(minArea).trim() !== '') {
            const n = Number(minArea);
            if (!Number.isNaN(n)) areaRange.$gte = n;
        }
        if (maxArea !== undefined && String(maxArea).trim() !== '') {
            const n = Number(maxArea);
            if (!Number.isNaN(n)) areaRange.$lte = n;
        }
        if (Object.keys(areaRange).length > 0) {
            filter.area = areaRange;
        }

        const sortObj = parseSort(sort);

        const [countries, total] = await Promise.all([
            Country.find(filter).sort(sortObj).skip(skip).limit(limitNum),
            Country.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limitNum) || 1;
        const prevPage = pageNum > 1 ? pageNum - 1 : null;
        const nextPage = pageNum < totalPages ? pageNum + 1 : null;

        res.status(200).json({
            success: true,
            data: countries,
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
        res.status(500);
        throw new Error(`Failed to get countries: ${error.message}`);
    }
};

const getCountryById = async (req, res) => {
    try {
        const country = await Country.findById(req.params.id);
        if (!country) {
            res.status(404);
            throw new Error('Country not found');
        }
        res.status(200).json({ success: true, data: country });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to get country by id: ${error.message}`);
    }
};

export { getCountries, getCountryById };