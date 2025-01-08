import { Router } from "express";
const router = Router()
import { getAllPosts, createPost, getPost, putPost, patchPost, deletePost } from "../controllers/post.controllers.js";

router.route('/').get(getAllPosts)
router.post('/', createPost)
router.get('/:id', getPost)
router.put('/:id', putPost)
router.patch('/:id', patchPost)
router.delete('/:id', deletePost)

export default router