const Post = require("../models/postModel")
const User = require("../models/userModel")
const path = require("path")
const fs = require("fs")
const {v4: uuid} = require("uuid")
const HttpError = require("../models/errorModel")




// ====================== CREATE A POST
// POST : api/posts
// PROTECTED
const createPost = async(req, res, next) => {
    try {
        let {title, category, description} = req.body
        if (!title || !category || !description || !req.files) {
            return next(new HttpError("Preencha todos os campos e escolha uma thumbnail.", 422))
        }

        const {thumbnail} = req.files

        // Verificar o tamanho da thumbnail (não pode ser maior que 2MB)

        if (thumbnail.size > 2000000) {
            return next(new HttpError("Thumbail grande demais. O arquivo não pode ser maior que 2MB."))
        }

        let fileName = thumbnail.name
        let splittedFileName = fileName.split('.')
        let newFileName = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1]
        thumbnail.mv(path.join(__dirname, '..', '/uploads', newFileName), async (err) => {
            if (err) {
                return next(new HttpError(err))
            } else {
                const newPost = await Post.create({title, category, description, thumbnail: newFileName, creator: req.user.id})
                if (!newPost) {
                    return next(new HttpError("Post não pode ser criado.", 422))
                }
                // Encontrar usuário e aumentar a contagem de post em +1
                const currentUser = await User.findById(req.user.id)
                const userPostCount = currentUser.posts + 1
                await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})

                res.status(201).json(newPost)
            }

        })
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ====================== GET ALL POSTS
// GET : api/posts
// UNPROTECTED
const getPosts = async(req, res, next) => {
    try {
        const posts = await Post.find().sort({updatedAt: -1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ====================== GET SINGLE POST
// GET : api/posts/:id
// UNPROTECTED
const getSinglePost = async(req, res, next) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post) {
            return next(new HttpError("Post não encontrado.", 404))
        }
        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ====================== GET POST BY CATEGORY
// GET : api/posts/categories/:category
// UNPROTECTED
const getCatPost = async(req, res, next) => {
    try {
        const {category} = req.params
        const catPost = await Post.find({category}).sort({createdAt: -1})
        res.status(200).json(catPost)
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ====================== GET AUTHOR POST
// POST : api/posts/users/:id
// UNPROTECTED
const getUserPosts = async(req, res, next) => {
    try {
        const {id} = req.params
        const posts = await Post.find({creator: id}).sort({createdAt: -1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ====================== EDIT POST
// PATCH : api/posts/:id
// PROTECTED
const editPost = async(req, res, next) => {
    try {
        let fileName
        let newFileName
        let updatedPost
        const postId = req.params.id
        let {title, category, description} = req.body

        if (!title || !category || description.length < 12) {
            return next(new HttpError("Preencha todos os campos.", 422))
        }
        
        // Receber o post antigo do banco de dados
        const oldPost = await Post.findById(postId)
        if (req.user.id == oldPost.creator) {
            if (!req.files) {
                updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description}, {new: true})
            } else {
                // Deletar a thumbnail antiga do upload
                fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                    if (err) {
                        return next(new HttpError(err))
                    }
                    
                })
                // Upload nova thumbnail
                const {thumbnail} = req.files
                // Checar o tamanho do arquivo
                if (thumbnail.size > 2000000) {
                    return next(new HttpError("Thumbnail grande demais. Deve ter no máximo 2MB."))
                }
                fileName = thumbnail.name
                let splittedFileName = fileName.split('.')
                newFileName = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1]
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
                    if (err) {
                        return next(new HttpError(err))
                    }
                })

                updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description, thumbnail: newFileName}, {new: true})
            }
        }

        if (!updatedPost) {
            return next(new HttpError("Erro! Post não pode ser atualizado."))
        }

        res.status(200).json(updatedPost)

    } catch (error) {
        return next(new HttpError(error))
    }
}



// ====================== DELETE POST
// DELETE : api/posts/:id
// PROTECTED
const deletePost = async(req, res, next) => {
    try {
        const postId = req.params.id
        if (!postId) {
            return next(new HttpError("Post não disponível", 400))
        }
        const post = await Post.findById(postId)
        const fileName = post?.thumbnail
        if (req.user.id == post.creator) {
            // Deletar thumbnail do folder uploads
            fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
                if (err) {
                    return next(new HttpError(err))
                } else {
                    await Post.findByIdAndDelete(postId)
                    // Encontrar o usuário e reduzir sua contagem de post em -1
                    const currentUser = await User.findById(req.user.id)
                    const userPostCount = currentUser?.posts - 1
                    await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})
                    res.json(`Post ${postId} deletado com sucesso.`)
                }
    
            })
        } else {
            return next(new HttpError("Post não pode ser deletado.", 403))
        }
    } catch (error) {
        return next(new HttpError(error))
    }
}

module.exports = {createPost, getPosts, getSinglePost, getCatPost, getUserPosts, editPost, deletePost}
