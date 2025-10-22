import mongoose from 'mongoose'

const fixtureSchema = new mongoose.Schema({
  externalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  homeTeam: {
    type: String,
    required: true
  },
  awayTeam: {
    type: String,
    required: true
  },
  homeTeamId: {
    type: String,
    required: true
  },
  awayTeamId: {
    type: String,
    required: true
  },
  kickoffTime: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'live', 'finished', 'cancelled'],
    default: 'pending',
    index: true
  },
  homeScore: {
    type: Number,
    default: null
  },
  awayScore: {
    type: Number,
    default: null
  },
  gameweek: {
    type: Number,
    index: true
  },
  pools: {
    win: {
      total: { type: Number, default: 0 },
      betCount: { type: Number, default: 0 }
    },
    draw: {
      total: { type: Number, default: 0 },
      betCount: { type: Number, default: 0 }
    },
    lose: {
      total: { type: Number, default: 0 },
      betCount: { type: Number, default: 0 }
    }
  },
  winningOutcome: {
    type: String,
    enum: ['win', 'draw', 'lose'],
    default: null
  },
  isPayoutProcessed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Virtual for fixture ID
fixtureSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Virtual for total pool size
fixtureSchema.virtual('totalPoolSize').get(function() {
  return this.pools.win.total + this.pools.draw.total + this.pools.lose.total
})

// Method to get winning outcome based on match result
fixtureSchema.methods.getWinningOutcome = function() {
  if (this.status !== 'finished' || this.homeScore === null || this.awayScore === null) {
    return null
  }

  if (this.homeScore > this.awayScore) {
    return 'win' // Home team wins
  } else if (this.homeScore === this.awayScore) {
    return 'draw'
  } else {
    return 'lose' // Home team loses
  }
}

// Method to calculate payout
fixtureSchema.methods.calculatePayout = function() {
  const winningOutcome = this.getWinningOutcome()
  if (!winningOutcome) return null

  const totalPool = this.totalPoolSize
  const winningPool = this.pools[winningOutcome].total
  
  if (winningPool === 0) return null

  return {
    winningOutcome,
    totalPool,
    winningPool,
    payoutRate: 0.95, // 95% payout
    totalPayout: totalPool * 0.95
  }
}

// Method to update pools when bet is placed
fixtureSchema.methods.updatePool = function(outcome, amount) {
  if (this.pools[outcome]) {
    this.pools[outcome].total += amount
    this.pools[outcome].betCount += 1
  }
}

// Ensure virtual fields are serialized
fixtureSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id
    delete ret.__v
    return ret
  }
})

const Fixture = mongoose.model('Fixture', fixtureSchema)

export default Fixture
