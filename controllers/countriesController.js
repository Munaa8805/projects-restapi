import Country from '../models/Country.js';

const getCountries = async (req, res) => {
    try {
        const countries = await Country.find();
        res.status(200).json({ success: true, data: countries });
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