const {Router} = require('express')

const {createPost, getPosts, getSinglePost, getCatPost, getUserPosts, editPost, deletePost} = require('../controllers/postController')
const authMiddleware = require('../middleware/authMiddleware')

const router = Router()

router.post('/', authMiddleware, createPost)
router.get('/', getPosts)
router.get('/:id', getSinglePost)
router.patch('/:id', authMiddleware, editPost)
router.get('/categories/:category', getCatPost)
router.get('/users/:id', getUserPosts)
router.delete('/:id', authMiddleware, deletePost)

module.exports = router