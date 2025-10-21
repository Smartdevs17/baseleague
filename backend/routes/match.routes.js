import { Router } from 'express'
import { fetchLeagues } from '../services/api/matches.js'


const router = Router()

router.get('/leagues', async (req, res) => {
    try {
        const data = await fetchLeagues();

        res.json(data.response)
    } catch (error) {
        console.error("Error in /leagues route:", error.message);
        res.status(500).json({ error: "Failed to fetch leagues" });
    }
})

export default router;