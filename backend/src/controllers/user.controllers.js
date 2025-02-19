import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import bcrypt from 'bcrypt'

const signupUser = async (req, res) => {
    const { fullName, username, email, password } = req.body

    try {
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existedUser) {
            return res.status(409).json({ message: 'Auth failed' })
        }

        const user = await User.create({ fullName, username, email, password })

        const createdUser = await User.findById(user._id).select(
            '-password -refreshToken'
        )

        if (!createdUser) {
            return res.status(500).json({ error: 'Something went wrong while registering the user' })
        }
        return res.status(201).json({
            createdUser,
            message: 'User registered successfully.'
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'All feilds are required' })
        }
        res.status(500).json({ error: error.message })
    }
}

const loginUser = async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email) {
        return res.status(400).json({ error: 'username or email is required' });
    }

    try {
        const user = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' })
        }

        await user.isPasswordCorrect
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}

const patchUser = async (req, res) => {
    const { id } = req.params
    const updates = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid user ID format' })
    }
    // Check for empty updates
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
    }

    try {
        if (updates.password) {
            if (typeof updates.password !== 'string') {
                return res.status(400).json({ error: 'Password must be a string' });
            }
            updates.password = await bcrypt.hash(updates.password, 10)
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json({ message: 'User details updated successfully' })
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message })
        }
        res.status(500).json({ error: error.message })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params

    try {
        // validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID format' })
        }

        const deletedUser = await User.findByIdAndDelete(id)
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export { signupUser, loginUser, patchUser, deleteUser }