import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const TransactionTable = ({ transactions = [], onEdit, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      // Return format M/D/YYYY or D-M-YYYY like slide
      return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}/${parts[0]}`;
    }
    return dateStr;
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-600 mb-1">No transactions found.</p>
        <p className="text-xs text-slate-400">Add a new transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">DATE</th>
              <th className="py-3.5 px-6">TITLE</th>
              <th className="py-3.5 px-6">CATEGORY</th>
              <th className="py-3.5 px-6">TYPE</th>
              <th className="py-3.5 px-6">PAYMENT MODE</th>
              <th className="py-3.5 px-6">AMOUNT</th>
              <th className="py-3.5 px-6 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {transactions.map((txn) => {
              const isIncome = txn.type === 'Income';
              return (
                <tr key={txn._id} className="hover:bg-slate-50/50 transition">
                  {/* Date */}
                  <td className="py-4 px-6 text-slate-500 text-xs font-semibold whitespace-nowrap">
                    {formatDate(txn.date)}
                  </td>

                  {/* Title & Notes */}
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 leading-tight">{txn.title}</p>
                    {txn.notes && (
                      <p className="text-xs text-slate-400 font-normal mt-0.5">{txn.notes}</p>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    {txn.category}
                  </td>

                  {/* Type Badge */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {txn.type}
                    </span>
                  </td>

                  {/* Payment Mode */}
                  <td className="py-4 px-6 text-slate-500">
                    {txn.paymentMode || 'Cash'}
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`font-bold text-sm ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}₹{Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(txn)}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(txn._id)}
                        className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50/50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
