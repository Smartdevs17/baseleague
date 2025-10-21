import { Router } from 'express'
import matchRoutes from './match.routes.js' 


const router = Router();

router.use('/', matchRoutes);

export default router;