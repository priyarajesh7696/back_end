import express from 'express'
import UserController from '../controller/user.js'
const router = express.Router()

router.get('/',UserController.getAllUsers)
router.get('/:id',UserController.getUserById)

router.post('/createuser',UserController.createUser)
router.post('/login',UserController.login)
router.post('/email-send',UserController.emailSend)
router.post('/verify',UserController.verifyCode)

router.post('/reset-password',UserController.resetPassword)

export default router