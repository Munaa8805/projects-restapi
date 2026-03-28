import mongoose from 'mongoose';

const IdeaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title must be less than 100 characters long'],
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Description must be less than 500 characters long'],
    },
    summary: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Summary must be less than 500 characters long'],
    },
    tags: {
        type: [String],
        required: true,
        trim: true,
        maxlength: [10, 'Tags must be less than 10 characters long'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
},
    {
        timestamps: true,
    }
);

const Idea = mongoose.model('Idea', IdeaSchema);

export default Idea;