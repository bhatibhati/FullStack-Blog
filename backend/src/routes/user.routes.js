import { Router } from 'express'
const router = Router()
import { signupUser, loginUser, patchUser, deleteUser } from '../controllers/user.controllers.js'

router.post('/', signupUser)
router.post('/', loginUser)
router.patch('/:id', patchUser)
router.delete('/:id', deleteUser)

export default router