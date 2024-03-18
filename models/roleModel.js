const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true
})

module.exports = mongoose.models?.Role || mongoose.model('Role', roleSchema)