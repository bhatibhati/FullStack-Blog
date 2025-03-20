import { Router } from 'express'
const router = Router()
import { signupUser, loginUser, logoutUser, refreshAccessToken, patchUser, deleteUser } from '../controllers/user.controllers.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

router.post('/signup',
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    signupUser)
router.post('/login', loginUser)
router.post('/logout', verifyJWT, logoutUser)
router.post('refresh-token', refreshAccessToken)

router.patch('/:id', patchUser)
router.delete('/:id', deleteUser)

export default router