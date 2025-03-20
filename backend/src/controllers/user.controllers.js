import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import bcrypt from 'bcrypt'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import { upload } from "../middlewares/multer.middleware.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        return res.status(500).json({ message: "SOmething went wrong while generating refresh and access token" })
    }
}

const signupUser = async (req, res) => {
    const { fullName, username, email, password } = req.body

    try {
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existedUser) {
            return res.status(409).json({ message: 'Auth failed' })
        }

        const avatarLocalPath = req.files?.avatar[0]?.path

        let coverImgLocalPath
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImgLocalPath = req.files.coverImage[0]?.path
        }

        if (!avatarLocalPath) {
            return res.status(400).json({ message: 'Avatar file is required' })
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImgLocalPath)

        if (!avatar) {
            return res.status(400).json({ message: 'Avatar file is required two' })
        }

        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || '',
            email,
            password,
            username: username
        })

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

    if (!username && !email) {
        return res.status(400).json({ error: 'username or email is required' });
    }

    try {
        const user = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' })
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        const loggedIdUser = await User.findById(user._id)
            .select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: 'Login successful',
                user: {
                    loggedIdUser, accessToken, refreshToken
                },
            })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}

const logoutUser = async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:
                { refreshToken: undefined }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json({ message: "User logged out" })
}

const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        return res.status(401).json({ message: 'Unauthorized request' })
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if (!user) {
            re.status(401).json({ message: 'Invalid refresh token' })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            res.status(401).json({ message: 'Refresh token is expired or used' })
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json({ accessToken, refreshToken: newRefreshToken, message: 'Access token refreshed' })

    } catch (error) {
        return res.status(401).json({ message: error?.message || 'invalid refresh token' })
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

export { signupUser, loginUser, logoutUser, refreshAccessToken, patchUser, deleteUser }