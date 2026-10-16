// In-memory data store when MongoDB URI is empty or disconnected
const memoryUsers = [
  {
    _id: '6ac3775bb0be955eecc3a3b7',
    name: 'Yug Patel',
    email: 'yug2211@gmail.com',
    password: '$2b$10$6d1V3yoVRMCok7LhS9axRS09vM3F7EVbrejZpelDZ.xVO9JH2CO6', // hashed 'password'
    createdAt: '2026-10-05T10:09:31.129+00:00',
    updatedAt: '2026-10-05T10:09:31.129+00:00',
  }
];

const memoryTransactions = [
  {
    _id: '6ac377e5b0be955eecc3a3b8',
    user: '6ac3775bb0be955eecc3a3b7',
    title: 'Salary',
    amount: 70000,
    category: 'Salary',
    type: 'Income',
    date: '2026-10-02',
    notes: 'Salary Credited !!',
    paymentMode: 'UPI',
    createdAt: '2026-10-05T10:11:49.026+00:00',
    updatedAt: '2026-10-05T10:11:49.026+00:00',
  },
  {
    _id: '6ac37810b0be955eecc3a3b9',
    user: '6ac3775bb0be955eecc3a3b7',
    title: 'Grocery',
    amount: 5000,
    category: 'Food',
    type: 'Expense',
    date: '2026-10-03',
    notes: 'Grocery',
    paymentMode: 'Cash',
    createdAt: '2026-10-05T10:12:32.297+00:00',
    updatedAt: '2026-10-05T10:12:32.297+00:00',
  },
  {
    _id: '6ac37825b0be955eecc3a3ba',
    user: '6ac3775bb0be955eecc3a3b7',
    title: 'Medical Checkup',
    amount: 2000,
    category: 'Health',
    type: 'Expense',
    date: '2026-10-03',
    notes: 'Medical Checkup',
    paymentMode: 'UPI',
    createdAt: '2026-10-05T10:13:00.000+00:00',
    updatedAt: '2026-10-05T10:13:00.000+00:00',
  }
];

module.exports = {
  memoryUsers,
  memoryTransactions,
};
