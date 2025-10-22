import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


const FOOTBALL_API_KEY = process.env.RAPID_API_KEY;
const FOOTBALL_BASE_API_URL = process.env.FOOTBALL_BASE_API_URL;

export const fetchLeagues = async () => {
    try {
        const response = await axios.get(`${FOOTBALL_BASE_API_URL}/football-get-all-leagues`, {
            headers: {
                "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
                "x-rapidapi-key": FOOTBALL_API_KEY,
            },
            timeout: 10000
        })

        console.log(FOOTBALL_API_KEY, FOOTBALL_BASE_API_URL)
        console.log(`${FOOTBALL_BASE_API_URL}/football-get-all-leagues`)
        return response.data;
    } catch (error) {
        console.log(FOOTBALL_API_KEY, FOOTBALL_BASE_API_URL)
        console.log(`${FOOTBALL_BASE_API_URL}/football-get-all-leagues`)
        console.error("Error fetching leagues:", error.message);
        throw new Error("Failed to fetch leagues")
    }
}