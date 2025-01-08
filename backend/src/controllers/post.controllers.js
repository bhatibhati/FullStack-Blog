import { Post } from "../models/post.model";

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
        res.json(posts)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts.' })
    }
}

const createPost = async (req, res) => {
    try {
        const newPost = await Post.create(req.body)
        res.status(201).json(newPost)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const getPost = async (req, res) => {
    const { id } = req.params
    try {
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ error: 'Post not found.' })
        }
        res.json(post)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch the post.' })
    }
}

const patchPost = async (req, res) => {
    const { id } = req.params
    const updates = req.body

    try {
        const updatedPost = await Post.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
        if (!updatedPost) {
            return res.status(404).json({ error: 'Post to be updated not found.' })
        }
        res.status(200).json(updatedPost)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message })
        }
        res.status(500).json({ error: 'Failed to update post.' })
    }
}

const putPost = async (req, res) => {
    const { id } = req.params
    const { title, content, author, categories } = req.body
    if (!title || content == null || author == null || categories == null) {
        return res.status(400).json({ error: '"All fields (title, content, author, categories) are required for PUT request."' })
    }

    try {
        const updatePost = await Post.findOneAndReplace(
            { _id: id },
            { title, content, author, categories },
            { new: true, runValidators: true }
        )
        if (!updatePost) {
            return res.status(400).json({ error: 'Failed to replace post.' })
        }
        res.status(200).json(updatePost)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message })
        }
        res.status(500).json({ error: 'Failed to replace post.' })
    }
}

const deletePost = async (req, res) => {
    const { id } = req.params
    try {
        const deletedPost = await Post.findByIdAndDelete(id)
        if (!deletedPost) {
            return res.status(400).json({ error: 'Post to be deleted not found.' })
        }
        res.status(204).send()
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete the post.' })
    }
}

export { getAllPosts, createPost, getPost, patchPost, putPost, deletePost }