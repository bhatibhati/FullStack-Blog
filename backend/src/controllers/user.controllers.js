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
            $unset:
                { refreshToken: 1 }
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
            res.status(401).json({ message: 'Invalid refresh token' })
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

const changeCurrentPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Invalid password' })
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    res.status(200).json({ message: 'Password changed successfully' })
}

const getCurrentUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not found or unauthorized' })
    }

    return res.status(200).json({ user: req.user, message: 'User retrieved successfully' })
}

const patchUser = async (req, res) => {
    const userId = req.user._id
    const updates = req.body

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
            userId,
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

const updateUserAvatar = async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        return res.status(400).json({ message: 'Avatar file is missing' })
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        return res.status(400).json({ message: 'Error while uploading on avatar' })
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select('-password')

    return res.status(200).json({ user, message: 'Avatar image updated successfully' })

}

const updateUserCoverImage = async (req, res) => {
    const coverImgLocalPath = req.file?.path

    if (!coverImgLocalPath) {
        return res.status(400).json({ message: 'Cover image file is missing' })
    }

    const coverImg = await uploadOnCloudinary(coverImgLocalPath)

    if (!coverImg.url) {
        return res.status(400).json({ message: 'Error while uploading cover image' })
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImg.url
            }
        },
        { new: true }
    ).select('-password')

    return res.status(200).json({ user, message: 'Cover image updated successfully' })

}

const deleteUser = async (req, res) => {
    try {
        const userId = req.user._id
        const deletedUser = await User.findByIdAndDelete(userId)
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export { signupUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, patchUser, deleteUser, updateUserAvatar, updateUserCoverImage, getCurrentUser }