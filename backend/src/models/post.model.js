import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Post title is required.'],
        trim: true,
        index: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    readingTime: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    categories: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    media: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
    }],
    views: {
        type: Number,
        default: 0
    },
    likes: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: { type: Date, default: Date.now }
    },
    highlights: [{
        text: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        replies: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: { type: String, required: true },
            createdAt: Date
        }],
        createdAt: Date
    }]
}, { timestamps: true })

export const Post = mongoose.model('Post', PostSchema)