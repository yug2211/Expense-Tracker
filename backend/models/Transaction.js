const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a transaction title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    type: {
      type: String,
      enum: ['Income', 'Expense'],
      required: [true, 'Please select transaction type'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    paymentMode: {
      type: String,
      required: [true, 'Please select payment mode'],
      default: 'Cash',
    },
    date: {
      type: String,
      required: [true, 'Please add a date'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
