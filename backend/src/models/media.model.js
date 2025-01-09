import mongoose, { Schema } from "mongoose";

const MediaSchema = new Schema({
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'document'] },
    filename: String,
    size: Number,
    uploadeBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    altText: String,
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    metadata: {
        width: Number,
        height: Number,
        duration: Number,
        format: String,
    },
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    usedInPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true })

export const Media = mongoose.model('Media', MediaSchema)