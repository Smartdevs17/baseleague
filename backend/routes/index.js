import { Router } from 'express'
import matchRoutes from './match.routes.js'
import bettingRoutes from './betting.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.use('/', matchRoutes)
router.use('/betting', bettingRoutes)
router.use('/users', userRoutes)

export default router