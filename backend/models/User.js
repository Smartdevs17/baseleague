import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v)
      },
      message: 'Invalid Ethereum wallet address format'
    }
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_]+$/.test(v)
      },
      message: 'Username can only contain letters, numbers, and underscores'
    }
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bettingStats: {
    totalBets: {
      type: Number,
      default: 0
    },
    totalWon: {
      type: Number,
      default: 0
    },
    totalLost: {
      type: Number,
      default: 0
    },
    totalWinnings: {
      type: Number,
      default: 0
    },
    totalStaked: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      matchUpdates: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  nonce: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Virtual for user ID
userSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Method to generate nonce for wallet authentication
userSchema.methods.generateNonce = function() {
  const nonce = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15)
  this.nonce = nonce
  return nonce
}

// Method to update betting stats
userSchema.methods.updateBettingStats = function(betResult, amount, winnings = 0) {
  this.bettingStats.totalBets += 1
  this.bettingStats.totalStaked += amount
  
  if (betResult === 'won') {
    this.bettingStats.totalWon += 1
    this.bettingStats.totalWinnings += winnings
  } else if (betResult === 'lost') {
    this.bettingStats.totalLost += 1
  }
  
  // Calculate win rate
  const totalCompleted = this.bettingStats.totalWon + this.bettingStats.totalLost
  if (totalCompleted > 0) {
    this.bettingStats.winRate = (this.bettingStats.totalWon / totalCompleted) * 100
  }
}

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this.id,
    walletAddress: this.walletAddress,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    bettingStats: this.bettingStats,
    lastActive: this.lastActive
  }
}

// Static method to find or create user by wallet address
userSchema.statics.findOrCreateByWallet = async function(walletAddress, userData = {}) {
  let user = await this.findOne({ walletAddress: walletAddress.toLowerCase() })
  
  if (!user) {
    // Generate unique username if not provided
    let username = userData.username
    if (!username) {
      const baseUsername = `user_${walletAddress.slice(2, 8)}`
      let counter = 1
      username = baseUsername
      
      while (await this.findOne({ username })) {
        username = `${baseUsername}_${counter}`
        counter++
      }
    }
    
    user = new this({
      walletAddress: walletAddress.toLowerCase(),
      username,
      displayName: userData.displayName || userData.username,
      ...userData
    })
    
    await user.save()
  }
  
  return user
}

// Index for efficient queries
userSchema.index({ 'bettingStats.totalWinnings': -1 }) // For leaderboard
userSchema.index({ lastActive: -1 })

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id
    delete ret.__v
    delete ret.nonce
    return ret
  }
})

const User = mongoose.model('User', userSchema)

export default User
