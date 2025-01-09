import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add your full name'],
        trim: true,
        index: true
    },
    username: {
        type: String,
        required: [true, 'Please provide a username.'],
        minlength: [3, 'Username must be 3 letters long'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email address.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\S+@\S+\.\S+$/,
            'Please provide a valid email address.'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required.']
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio should not be more than 200'],
        default: "",
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'writer', 'reader'],
        default: 'reader'
    },
    avatar: {
        type: String,
        default: null
    },
    dob: {
        type: Date,
        default: null
    },
    location: {
        city: { type: String, default: null },
        country: { type: String, default: null },
    },
    socialMediaLinks: {
        facebook: { type: String, default: null },
        instagram: { type: String, default: null },
        twitter: { type: String, default: null },
        youtube: { type: String, default: null },
        linkedin: { type: String, default: null },
        github: { type: String, default: null }
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    bookmarks: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model('User', UserSchema)