const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const {v4: uuid} = require('uuid')


const User = require('../models/userModel')
const HttpError = require("../models/errorModel")



// ====================== REGISTER A NEW USER
// POST : api/users/register


// UNPROTECTED
const registerUser = async (req, res, next) => {
    try {
        const {name, email, password, confirmPassword} = req.body;
        if (!name || !email || !password) {
            return next(new HttpError("Preencha todos os campos.", 422))
        }

        const newEmail = email.toLowerCase()

        const emailExists = await User.findOne({email: newEmail})
        if (emailExists) {
            return next(new HttpError("Email já cadastrado.", 422))
        }

        if ((password.trim()).length < 6) {
            return next(new HttpError("Senha deve ter pelo menos 6 caracteres.", 422))
        }

        if (password !== confirmPassword) {
            return next(new HttpError("As senhas não são iguais.", 422))
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt)

        const newUser = await User.create({name, email: newEmail, password: hashedPass})
        res.status(201).json(`Novo usuário ${newUser.email} cadastrado.`)

    } catch (error) {
        return next(new HttpError("Registro do usuário falhou", 422))
    }
}







// ====================== LOGIN A REGISTERED USER
// POST : api/users/login
// UNPROTECTED
const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new HttpError("Preencha todos os campos.", 422))
        }

        const newEmail = email.toLowerCase();

        const user = await User.findOne({email: newEmail})
        if (!user) {
            return next(new HttpError("Email inválido.", 422))
        }

        const comparePass = await bcrypt.compare(password, user.password)
        if (!comparePass) {
            return next(new HttpError("Senha inválida", 422))
        }

        const {_id: id, name} = user
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json({token, id, name})

    } catch (error) {
        return next(new HttpError("Falha ao realizar o login. Favor verificar seus dados.", 422))
    }
}







// ====================== USER PROFILE
// POST : api/users/:id
// PROTECTED
const getUser = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id).select('-password')
        if (!user) {
            return next(new HttpError("Usuário não encontrado.", 404))
        }

        res.status(200).json(user)
    } catch (error) {
        return next(new HttpError(error))
    }
}







// ====================== CHANGE USER AVATAR (profile picture)
// POST : api/users/change-avatar
// PROTECTED
const changeAvatar = async (req, res, next) => {
    try {
        if (!req.files.avatar) {
            return next(new HttpError("Por favor, selecione uma imagem.", 422))
        }

        // Encontrar usuário do Banco de Dados
        const user = await User.findById(req.user.id)
        // Deletar avatar antigo se existir
        if (user.avatar && user.avatar !== '../uploads/avatar-default.jpg') {
            fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
                if (err) {
                    return next(new HttpError(err))
                }
            })
        }

        const {avatar} = req.files
        // Verificar o tamanho do arquivo
        if (avatar.size > 500000) {
            return next(new HttpError("Imagem de perfil muito grande. Deve ser menor que 500kb", 422))
        }

        let fileName
        fileName = avatar.name
        let splittedFileName = fileName.split('.')
        let newFileName = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1]
        avatar.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
            if (err) {
                return next(new HttpError(err))
            }

            const updatedAvatar = await User.findByIdAndUpdate(req.user.id, {avatar: newFileName}, {new: true})
            if (!updatedAvatar) {
                return next(new HttpError("Avatar não pode ser alterado.", 422))
            }
            res.status(200).json(updatedAvatar)
        })
    } catch (error) {
        return next(new HttpError(error))
    }
}








// ====================== EDIT USER DETAILS (from profile)
// POST : api/users/edit-user
// PROTECTED
const editUser = async (req, res, next) => {
    try {
        const {name, email, password, confirmPassword, confirmNewPassword} = req.body
        if (!name || !email || !password || !confirmPassword || !confirmNewPassword) {
            return next(new HttpError("Preencha todos os campos.", 422))
        }

        // Pegue Usuário do banco de dados que deseja alterar os dados 
        const user = await User.findById(req.user.id)
        if (!user) {
            return next(new HttpError("Usuário não encontrado.", 403))
        }

        // Certificar-se que o novo email já não existe do banco de dados
        const emailExist = await User.findOne({email})
        // Nós queremos atualizar outros detalhes sem alterar o email (Que é único e usamos para fazer o login)
        if (emailExist && (emailExist._id != req.user.id)) {
            return next(new HttpError("Email já cadastrado.", 422))
        }

        // Compara a senha atual com a senha do banco de dados
        const validateUserPassword = await bcrypt.compare(password, user.password)
        if (!validateUserPassword) {
            return next(new HttpError("Senha atual inválida.", 422))
        }

        if ((confirmPassword.trim()).length < 6) {
            return next(new HttpError("A nova senha deve ter pelo menos 6 caracteres.", 422))
        }

        // Comparar as novas senhas
        if (confirmPassword !== confirmNewPassword) {
            return next(new HttpError("As senhas novas não são iguais.", 422))
        }

        // Hash nova senha
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(confirmPassword, salt)

        // Atualizar dados do usuário
        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password: hash}, {new: true})
        res.status(200).json(newInfo)
    } catch (error) {
        return next(new HttpError(error))
    }
}







// ====================== GET AUTHORS
// POST : api/users/authors
// UNPROTECTED
const getAuthors = async (req, res, next) => {
    try {
        const authors = await User.find().select('-password')
        res.json(authors)
    } catch (error) {
        return next(new HttpError(error))
    }
}





module.exports = {registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors}
