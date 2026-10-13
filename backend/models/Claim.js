const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    proof: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Verified', 'Returned'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
