import { User } from "../models/user.model.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const signupUser = async (req, res) => {
    const { fullName, username, email, password } = req.body

    try {
        const emailExists = await User.findOne({ email })
        const usernameExists = await User.findOne({ username })
        if (emailExists) {
            return res.status(409).json({ message: 'Email is already registered.' })
        }
        if (usernameExists) {
            return res.status(409).json({ message: 'Username is already taken.' })
        }

        // const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ fullName, username, email, password })
        await newUser.save()
        res.status(201).json({ message: 'User created successfully.' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'Invalid email or password' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

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

        const updatedUser = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })

        if (!updatedUser) {
            return res.status(404).json({ error: 'user not found' })
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
        const deletedUser = await User.findByIdAndDelete(id)
        if (!deletedUser) {
            return res.status(400).json({ error: 'User not found.' })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete the user.' })
    }
}

export { signupUser, loginUser, patchUser, deleteUser }