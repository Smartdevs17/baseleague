import mongoose from 'mongoose'

const betSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    index: true,
    lowercase: true
  },
  fixtureId: {
    type: String,
    required: true,
    index: true
  },
  teamId: {
    type: String,
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  outcome: {
    type: String,
    required: true,
    enum: ['win', 'draw', 'lose'],
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending',
    index: true
  },
  payout: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Compound index to prevent hedging (one bet per user per fixture)
betSchema.index({ userId: 1, fixtureId: 1 }, { unique: true })
betSchema.index({ walletAddress: 1, fixtureId: 1 }, { unique: true })

// Virtual for bet ID
betSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Ensure virtual fields are serialized
betSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id
    delete ret.__v
    return ret
  }
})

const Bet = mongoose.model('Bet', betSchema)

export default Bet
