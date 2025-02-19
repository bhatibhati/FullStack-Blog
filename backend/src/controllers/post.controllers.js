import mongoose from "mongoose";
import { Post } from "../models/post.model.js";


const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username email -_id')
        res.json(posts)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts.' })
    }
}

const createPost = async (req, res) => {
    const { title, content, author, description, status } = req.body

    try {
        if (!title || !content || !author) {
            return res.status(400).json({ error: 'Title, content, and author are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(author)) {
            return res.status(400).json({ error: 'Invalid user ID format' })
        }

        // check for author
        const authorExists = await mongoose.model('User').findById(author)
        if (!authorExists) {
            return res.status(404).json({ error: 'Author not found' })
        }

        // calculate reading time
        const wordCount = content.trim().split(/\s+/).length
        const readingTime = Math.ceil(wordCount / 200)

        const postData = {
            title,
            content,
            author,
            description,
            status,
            readingTime,
        }
        const newPost = await Post.create(postData)

        const populatedPost = await Post.findById(newPost._id)
            .populate('author', 'name email')

        res.status(201).json(populatedPost)
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message })
        }

        res.status(500).json({ error: 'Error creating post' })
    }
}

const getPost = async (req, res) => {
    const { id } = req.params
    try {
        const post = await Post.findById(id).populate('author', 'username')
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }
        res.json(post)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch the post' })
    }
}

const patchPost = async (req, res) => {
    const { id } = req.params
    const updates = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid post ID format' })
    }
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No updates provided' })
    }

    try {

        delete updates.author;  // Don't allow author changes
        delete updates.likes;   // Don't allow likes manipulation
        delete updates.views;

        // recalculate reading time
        if (updates.content) {
            const wordCount = updates.content.trim().split(/\s+/).length
            updates.readingTime = Math.ceil(wordCount / 200)
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('author', 'username email -_id')

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post to be updated not found' })
        }
        res.status(200).json(updatedPost)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message })
        }
        res.status(500).json({ error: 'Failed to update post' })
    }
}

// const putPost = async (req, res) => {
//     const { id } = req.params
//     const { title, content, author, categories } = req.body
//     if (!title || content == null || author == null || categories == null) {
//         return res.status(400).json({ error: '"All fields (title, content, author, categories) are required for PUT request."' })
//     }

//     try {
//         const updatePost = await Post.findOneAndReplace(
//             { _id: id },
//             { title, content, author, categories },
//             { new: true, runValidators: true }
//         )
//         if (!updatePost) {
//             return res.status(400).json({ error: 'Post not found' })
//         }
//         res.status(200).json(updatePost)
//     } catch (err) {
//         if (err.name === 'ValidationError') {
//             return res.status(400).json({ error: err.message })
//         }
//         res.status(500).json({ error: 'Failed to replace post' })
//     }
// }

const deletePost = async (req, res) => {
    const { id } = req.params
    try {
        // validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID format' })
        }

        const deletedPost = await Post.findByIdAndDelete(id)
        if (!deletedPost) {
            return res.status(404).json({ error: 'Post to be deleted not found.' })
        }
        res.status(204).send()
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete the post.' })
    }
}

export { getAllPosts, createPost, getPost, patchPost, deletePost }