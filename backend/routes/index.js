import { Router } from 'express'
import matchRoutes from './match.routes.js'
import bettingRoutes from './betting.routes.js'

const router = Router()

router.use('/', matchRoutes)
router.use('/betting', bettingRoutes)

export default router