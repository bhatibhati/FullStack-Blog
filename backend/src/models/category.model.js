import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    slug: { type: String, unique: true, required: true },
    order: { type: Number, default: 0 },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    metadata: {
        postCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    }
})

export const Category = mongoose.model('Category', CategorySchema)