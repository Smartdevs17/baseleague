import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

export async function connectDatabase() {
	try {
		const mongoUri = process.env.MONGODB_URI

		if (!mongoUri) {
			throw new Error('MONGODB_URI is not defined in environment variables')
		}

		await mongoose.connect(mongoUri, {
			// MongoDB connection options
		})

		logger.info('📦 Connected to MongoDB')
	} catch (error) {
		logger.error('❌ MongoDB connection error:', error)
		throw error
	}
}

export async function disconnectDatabase() {
	try {
		await mongoose.disconnect()
		logger.info('📦 Disconnected from MongoDB')
	} catch (error) {
		logger.error('❌ MongoDB disconnection error:', error)
		throw error
	}
}

