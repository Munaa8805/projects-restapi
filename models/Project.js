import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title must be less than 100 characters long'],
        trim: true,
    },
    slug: {
        type: String,

    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Description must be less than 500 characters long'],
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', ProjectSchema);

ProjectSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true, strict: true, locale: 'en' });
    next();
});

export default Project;