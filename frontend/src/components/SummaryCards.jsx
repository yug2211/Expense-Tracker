import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const SummaryCards = ({ summary = {} }) => {
  const {
    totalIncome = 0,
    totalExpenses = 0,
    currentBalance = 0,
    totalTransactions = 0,
  } = summary;

  const formatRupee = (val) => {
    return `₹${Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Income */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Income
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatRupee(totalIncome)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Expenses
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatRupee(totalExpenses)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
          <TrendingDown className="w-5 h-5" />
        </div>
      </div>

      {/* Current Balance */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Current Balance
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatRupee(currentBalance)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      {/* Total Transactions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Transactions
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {totalTransactions}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
          <Activity className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
