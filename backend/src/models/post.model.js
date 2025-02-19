import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        index: true,
        maxlength: [100, 'Title must not exceed 100 characters'],
    },
    content: {
        type: String,
        required: [true, 'Content for the post is required']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author ID for post is required']
    },
    description: {
        type: String,
        required: [true, 'Post description is required'],
        trim: true,
        maxLength: [150, 'Post description cannot exceed 100 characters']
    },
    readingTime: {
        type: Number,
        default: 0
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
        url: {
            type: String,
            required: true
        },
        altText: {
            type: String,
            trim: true
        },
        metadata: {
            width: Number,
            height: Number,
        }
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
        addedAt: {
            type: Date,
            default: null
        }
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
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        replies: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            content: {
                type: String,
                required: true
            },
            createdAt: Date
        }],
        createdAt: Date
    }]
}, { timestamps: true })

export const Post = mongoose.model('Post', PostSchema)