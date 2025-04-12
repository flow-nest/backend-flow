import { isAdmin } from './../middleware/isAdmin';
import { verifyToken } from './../middleware/verifyToken';
// routes/adminRoutes.ts
import express from 'express'
import userController from '../controllers/admin.controller'

const router = express.Router()

// Routes accessible only by admin
router.use(verifyToken, isAdmin)

router.get('/users', userController.getAllUsers)
router.get('/users/:id', userController.getUserById)
router.post('/users', userController.createUser)
router.put('/users/:id', userController.updateUser)

export default router
