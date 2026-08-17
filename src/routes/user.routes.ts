import { Router } from 'express'
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/user.controller'

const router = Router()

router.get('/get-users', getUsers)
router.get('/get-user/:id', getUserById)
router.post('/create-user', createUser)
router.put('/update-user/:id', updateUser)
router.delete('/delete-user/:id', deleteUser)

export default router