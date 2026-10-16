const Transaction = require('../models/Transaction');
const { getIsConnected } = require('../config/db');
const { memoryTransactions } = require('./memoryStore');

// Helper to filter and sort memory transactions
const filterMemoryTransactions = (userId, { search, type, category, sort }) => {
  let list = memoryTransactions.filter((t) => t.user === userId || String(t.user) === String(userId));

  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter((t) => t.title.toLowerCase().includes(s) || (t.notes && t.notes.toLowerCase().includes(s)));
  }

  if (type && type !== 'All' && type !== 'All Types') {
    list = list.filter((t) => t.type.toLowerCase() === type.toLowerCase());
  }

  if (category && category !== 'All' && category !== 'All Categories') {
    list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }

  // Sorting
  if (sort === 'Oldest Date') {
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sort === 'Highest Amount') {
    list.sort((a, b) => b.amount - a.amount);
  } else if (sort === 'Lowest Amount') {
    list.sort((a, b) => a.amount - b.amount);
  } else {
    // Default Newest Date
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return list;
};

// @desc    Get user transactions with search, filter, sort & summary metrics
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, type, category, sort } = req.query;

    if (getIsConnected()) {
      let query = { user: userId };

      if (search && search.trim()) {
        query.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { notes: { $regex: search.trim(), $options: 'i' } },
        ];
      }

      if (type && type !== 'All' && type !== 'All Types') {
        query.type = type;
      }

      if (category && category !== 'All' && category !== 'All Categories') {
        query.category = category;
      }

      let sortOption = { date: -1, createdAt: -1 };
      if (sort === 'Oldest Date') {
        sortOption = { date: 1, createdAt: 1 };
      } else if (sort === 'Highest Amount') {
        sortOption = { amount: -1 };
      } else if (sort === 'Lowest Amount') {
        sortOption = { amount: 1 };
      }

      const transactions = await Transaction.find(query).sort(sortOption);

      // Compute total summary metrics for user
      const allUserTxns = await Transaction.find({ user: userId });
      const totalIncome = allUserTxns
        .filter((t) => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = allUserTxns
        .filter((t) => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const currentBalance = totalIncome - totalExpenses;
      const totalTransactions = allUserTxns.length;

      return res.json({
        transactions,
        summary: {
          totalIncome,
          totalExpenses,
          currentBalance,
          totalTransactions,
        },
      });
    } else {
      // In-memory fallback
      const filtered = filterMemoryTransactions(userId, { search, type, category, sort });
      const allUserTxns = memoryTransactions.filter(
        (t) => t.user === userId || String(t.user) === String(userId)
      );

      const totalIncome = allUserTxns
        .filter((t) => t.type === 'Income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = allUserTxns
        .filter((t) => t.type === 'Expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const currentBalance = totalIncome - totalExpenses;
      const totalTransactions = allUserTxns.length;

      return res.json({
        transactions: filtered,
        summary: {
          totalIncome,
          totalExpenses,
          currentBalance,
          totalTransactions,
        },
      });
    }
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, paymentMode, date, notes } = req.body;

    if (!title || !amount || !type || !category || !date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (getIsConnected()) {
      const transaction = await Transaction.create({
        user: req.user._id,
        title,
        amount: Number(amount),
        type,
        category,
        paymentMode: paymentMode || 'Cash',
        date,
        notes: notes || '',
      });
      return res.status(201).json(transaction);
    } else {
      const newTxn = {
        _id: 'txn_' + Date.now(),
        user: req.user._id,
        title,
        amount: Number(amount),
        type,
        category,
        paymentMode: paymentMode || 'Cash',
        date,
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryTransactions.unshift(newTxn);
      return res.status(201).json(newTxn);
    }
  } catch (error) {
    console.error('createTransaction error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type, category, paymentMode, date, notes } = req.body;

    if (getIsConnected()) {
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (transaction.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
      }

      transaction.title = title !== undefined ? title : transaction.title;
      transaction.amount = amount !== undefined ? Number(amount) : transaction.amount;
      transaction.type = type !== undefined ? type : transaction.type;
      transaction.category = category !== undefined ? category : transaction.category;
      transaction.paymentMode = paymentMode !== undefined ? paymentMode : transaction.paymentMode;
      transaction.date = date !== undefined ? date : transaction.date;
      transaction.notes = notes !== undefined ? notes : transaction.notes;

      const updatedTransaction = await transaction.save();
      return res.json(updatedTransaction);
    } else {
      const index = memoryTransactions.findIndex((t) => String(t._id) === String(id));
      if (index === -1) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      const txn = memoryTransactions[index];
      if (String(txn.user) !== String(req.user._id)) {
        return res.status(401).json({ message: 'User not authorized' });
      }

      const updated = {
        ...txn,
        title: title !== undefined ? title : txn.title,
        amount: amount !== undefined ? Number(amount) : txn.amount,
        type: type !== undefined ? type : txn.type,
        category: category !== undefined ? category : txn.category,
        paymentMode: paymentMode !== undefined ? paymentMode : txn.paymentMode,
        date: date !== undefined ? date : txn.date,
        notes: notes !== undefined ? notes : txn.notes,
        updatedAt: new Date().toISOString(),
      };

      memoryTransactions[index] = updated;
      return res.json(updated);
    }
  } catch (error) {
    console.error('updateTransaction error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (transaction.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
      }

      await transaction.deleteOne();
      return res.json({ message: 'Transaction removed' });
    } else {
      const index = memoryTransactions.findIndex((t) => String(t._id) === String(id));
      if (index === -1) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (String(memoryTransactions[index].user) !== String(req.user._id)) {
        return res.status(401).json({ message: 'User not authorized' });
      }

      memoryTransactions.splice(index, 1);
      return res.json({ message: 'Transaction removed' });
    }
  } catch (error) {
    console.error('deleteTransaction error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get analytics (Expenses by Category, Income by Category, Expenses by Payment Mode)
// @route   GET /api/transactions/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    let allTxns = [];

    if (getIsConnected()) {
      allTxns = await Transaction.find({ user: userId });
    } else {
      allTxns = memoryTransactions.filter(
        (t) => String(t.user) === String(userId)
      );
    }

    // Expenses by Category
    const expensesByCategoryMap = {};
    allTxns
      .filter((t) => t.type === 'Expense')
      .forEach((t) => {
        expensesByCategoryMap[t.category] = (expensesByCategoryMap[t.category] || 0) + t.amount;
      });

    // Income by Category
    const incomeByCategoryMap = {};
    allTxns
      .filter((t) => t.type === 'Income')
      .forEach((t) => {
        incomeByCategoryMap[t.category] = (incomeByCategoryMap[t.category] || 0) + t.amount;
      });

    // Expenses by Payment Mode
    const expensesByPaymentModeMap = {};
    allTxns
      .filter((t) => t.type === 'Expense')
      .forEach((t) => {
        const mode = t.paymentMode || 'Cash';
        expensesByPaymentModeMap[mode] = (expensesByPaymentModeMap[mode] || 0) + t.amount;
      });

    res.json({
      expensesByCategory: Object.keys(expensesByCategoryMap).map((cat) => ({
        category: cat,
        amount: expensesByCategoryMap[cat],
      })),
      incomeByCategory: Object.keys(incomeByCategoryMap).map((cat) => ({
        category: cat,
        amount: incomeByCategoryMap[cat],
      })),
      expensesByPaymentMode: Object.keys(expensesByPaymentModeMap).map((mode) => ({
        paymentMode: mode,
        amount: expensesByPaymentModeMap[mode],
      })),
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get monthly reports and custom date range report
// @route   GET /api/transactions/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year = '2026', startDate, endDate } = req.query;

    let allTxns = [];
    if (getIsConnected()) {
      allTxns = await Transaction.find({ user: userId });
    } else {
      allTxns = memoryTransactions.filter((t) => String(t.user) === String(userId));
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyExpenses = months.map((month, idx) => {
      const total = allTxns
        .filter((t) => {
          if (t.type !== 'Expense') return false;
          const d = new Date(t.date);
          return d.getFullYear().toString() === year && d.getMonth() === idx;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      return { month, amount: total };
    });

    let customDateReport = null;
    if (startDate && endDate) {
      const filteredRange = allTxns.filter((t) => {
        const d = new Date(t.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });

      const totalIncome = filteredRange
        .filter((t) => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = filteredRange
        .filter((t) => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

      customDateReport = {
        startDate,
        endDate,
        transactionsCount: filteredRange.length,
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        transactions: filteredRange,
      };
    }

    res.json({
      year,
      monthlyExpenses,
      customDateReport,
    });
  } catch (error) {
    console.error('getReports error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Export transactions to CSV format
// @route   GET /api/transactions/export
// @access  Private
const exportCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    let allTxns = [];

    if (getIsConnected()) {
      allTxns = await Transaction.find({ user: userId }).sort({ date: -1 });
    } else {
      allTxns = memoryTransactions
        .filter((t) => String(t.user) === String(userId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // CSV header exactly matching presentation slide 8:
    // Date, Title, Amount, Type, Category
    let csv = 'Date,Title,Amount,Type,Category,Payment Mode,Notes\n';
    allTxns.forEach((t) => {
      const formattedDate = t.date;
      const cleanTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
      const cleanCategory = `"${(t.category || '').replace(/"/g, '""')}"`;
      const cleanMode = `"${(t.paymentMode || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;
      csv += `${formattedDate},${cleanTitle},${t.amount},${t.type},${cleanCategory},${cleanMode},${cleanNotes}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('exportCSV error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics,
  getReports,
  exportCSV,
};
