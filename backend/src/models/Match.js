import mongoose from 'mongoose'

const matchSchema = new mongoose.Schema(
	{
		gameweek: {
			type: Number,
			required: true,
			index: true,
		},
		matchId: {
			type: Number,
			required: true,
			index: true,
		},
		homeTeam: {
			type: String,
			required: true,
		},
		awayTeam: {
			type: String,
			required: true,
		},
		homeScore: {
			type: Number,
			default: null,
		},
		awayScore: {
			type: Number,
			default: null,
		},
		status: {
			type: String,
			enum: ['NS', 'LIVE', 'HT', 'FT', 'CANCELED'],
			default: 'NS',
		},
		finished: {
			type: Boolean,
			default: false,
		},
		submittedToContract: {
			type: Boolean,
			default: false,
			index: true,
		},
		submittedAt: {
			type: Date,
			default: null,
		},
		submissionTxHash: {
			type: String,
			default: null,
		},
		lastChecked: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
)

// Compound index for unique matches
matchSchema.index({ gameweek: 1, matchId: 1 }, { unique: true })

// Index for finding unsubmitted finished matches
matchSchema.index({ finished: 1, submittedToContract: 1 })

const Match = mongoose.model('Match', matchSchema)

export default Match

