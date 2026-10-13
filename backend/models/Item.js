const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['lost', 'found'], required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    contact: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Returned'], default: 'Pending' },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
