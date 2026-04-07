import mongoose from 'mongoose';

const flagSchema = new mongoose.Schema({
    png: {
        type: String,
        required: true,
    },
    svg: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
    }
}, { _id: false });

const nativeNameSchema = new mongoose.Schema({
    official: String,
    common: String
}, { _id: false });

const nameSchema = new mongoose.Schema({
    common: {
        type: String,
        required: true,
        index: true
    },
    official: {
        type: String,
        required: true
    },
    nativeName: {
        type: Map,
        of: nativeNameSchema
    }
}, { _id: false });

const currencySchema = new mongoose.Schema({
    name: String,
    symbol: String
}, { _id: false });

const countrySchema = new mongoose.Schema({
    name: {
        type: nameSchema,
        required: true
    },

    flags: {
        type: flagSchema,
        required: true
    },

    currencies: {
        type: Map,
        of: currencySchema
    },

    languages: {
        type: Map,
        of: String
    },

    independent: {
        type: Boolean,
        default: null
    },

    capital: [{
        type: String
    }],

    borders: [{
        type: String
    }],

    area: {
        type: Number
    },

    population: {
        type: Number
    },

    continents: [{
        type: String
    }],
    yearlyData: {
        type: Map,
        of: Number
    },
    tourist_destinations: {
        type: [String],
        default: []
    },
    safety_score: {
        rank: {
            type: Number
        },
        score: {
            type: Number
        }
    }

}, {
    timestamps: true
});

const Country = mongoose.model('Country', countrySchema);

export default Country;