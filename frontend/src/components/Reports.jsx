import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

const Reports = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [monthlyData, setMonthlyData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customReport, setCustomReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/transactions/reports?year=${selectedYear}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await API.get(url);
      setMonthlyData(data.monthlyExpenses || []);
      setCustomReport(data.customDateReport || null);
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedYear, startDate, endDate]);

  const barData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: 'Monthly Expenses (₹)',
        data: monthlyData.map((d) => d.amount),
        backgroundColor: '#ef4444', // Red bar like slide 9
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Monthly Expenses Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-bold text-slate-800">Monthly Expenses</h4>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <div className="h-72 relative">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Custom Date Report Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-4">Custom Date Report</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {(!startDate || !endDate) ? (
          <p className="text-xs text-slate-400">
            Please select both start and end dates to view the report.
          </p>
        ) : customReport ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-200 pb-2">
              <span>Date Range: {customReport.startDate} to {customReport.endDate}</span>
              <span>Total Transactions: {customReport.transactionsCount}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-1">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-bold">Total Income</p>
                <p className="text-base font-bold text-emerald-600">
                  +₹{Number(customReport.totalIncome).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-bold">Total Expenses</p>
                <p className="text-base font-bold text-rose-600">
                  -₹{Number(customReport.totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-bold">Net Balance</p>
                <p className="text-base font-bold text-slate-900">
                  ₹{Number(customReport.netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Loading custom date report...</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
