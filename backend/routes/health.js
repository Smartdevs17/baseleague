import express from 'express'

const router = express.Router()

/**
 * GET /health - Health check endpoint
 */
router.get('/', (req, res) => {
	res.json({ status: 'ok', service: 'BaseLeague API Server' })
})

export default router

