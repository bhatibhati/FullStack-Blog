import { Router } from 'express'
const router = Router()
import { signupUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, patchUser, deleteUser, updateUserAvatar, updateUserCoverImage, getCurrentUser } from '../controllers/user.controllers.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import multer from 'multer'

router.post('/signup',
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImg', maxCount: 1 }
    ]),
    signupUser)
router.post('/login', loginUser)
router.post('/logout', verifyJWT, logoutUser)
router.post('/refresh-token', refreshAccessToken)
router.post('/change-password', verifyJWT, changeCurrentPassword)
router.get('/current-user', verifyJWT, getCurrentUser)
router.patch('/me', verifyJWT, patchUser)
router.patch('/avatar', verifyJWT, upload.single('avatar'), updateUserAvatar)
router.patch('/coverImg', verifyJWT, upload.single('coverImg'), updateUserCoverImage)
router.delete('/me', verifyJWT, deleteUser)

export default router