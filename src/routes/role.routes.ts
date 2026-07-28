import { Router } from 'express'

import { getRoles } from '../controllers/role.controller'

const router = Router()

router.get('/get-roles', getRoles)

export default router