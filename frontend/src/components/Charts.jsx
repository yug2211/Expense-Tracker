import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Charts = ({ analyticsData = {} }) => {
  const {
    expensesByCategory = [],
    incomeByCategory = [],
    expensesByPaymentMode = [],
  } = analyticsData;

  // Donut chart for Expenses by Category
  const expenseCategories = expensesByCategory.map((item) => item.category);
  const expenseCategoryAmounts = expensesByCategory.map((item) => item.amount);

  const expensesCategoryData = {
    labels: expenseCategories.length > 0 ? expenseCategories : ['No Data'],
    datasets: [
      {
        data: expenseCategoryAmounts.length > 0 ? expenseCategoryAmounts : [1],
        backgroundColor: [
          '#38bdf8', // sky
          '#34d399', // emerald
          '#f43f5e', // rose
          '#fbbf24', // amber
          '#a855f7', // purple
          '#818cf8', // indigo
        ],
        borderWidth: 0,
      },
    ],
  };

  // Donut chart for Income by Category
  const incomeCategories = incomeByCategory.map((item) => item.category);
  const incomeCategoryAmounts = incomeByCategory.map((item) => item.amount);

  const incomeCategoryData = {
    labels: incomeCategories.length > 0 ? incomeCategories : ['No Data'],
    datasets: [
      {
        data: incomeCategoryAmounts.length > 0 ? incomeCategoryAmounts : [1],
        backgroundColor: [
          '#38bdf8',
          '#a855f7',
          '#34d399',
          '#fbbf24',
          '#f43f5e',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Bar chart for Expenses by Payment Mode
  const paymentModes = expensesByPaymentMode.map((item) => item.paymentMode);
  const paymentModeAmounts = expensesByPaymentMode.map((item) => item.amount);

  const paymentModeData = {
    labels: paymentModes.length > 0 ? paymentModes : ['Cash', 'UPI'],
    datasets: [
      {
        label: 'Expenses (₹)',
        data: paymentModeAmounts.length > 0 ? paymentModeAmounts : [0, 0],
        backgroundColor: ['#eab308', '#a855f7', '#38bdf8', '#34d399', '#f43f5e'],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          font: { family: 'Plus Jakarta Sans', size: 11 },
        },
      },
    },
    cutout: '70%',
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Expenses by Category</h4>
          <div className="h-64 relative flex items-center justify-center">
            <Doughnut data={expensesCategoryData} options={chartOptions} />
          </div>
        </div>

        {/* Income by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Income by Category</h4>
          <div className="h-64 relative flex items-center justify-center">
            <Doughnut data={incomeCategoryData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Expenses by Payment Mode */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-4">Expenses by Payment Mode</h4>
        <div className="h-64 relative">
          <Bar data={paymentModeData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default Charts;
