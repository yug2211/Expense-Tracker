import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import Charts from '../components/Charts';
import Reports from '../components/Reports';
import Footer from '../components/Footer';
import { Download, Plus, X } from 'lucide-react';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    totalTransactions: 0,
  });
  const [analyticsData, setAnalyticsData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest Date');

  // Fetch transactions and summary
  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter && typeFilter !== 'All Types') params.append('type', typeFilter);
      if (categoryFilter && categoryFilter !== 'All Categories') params.append('category', categoryFilter);
      if (sortBy) params.append('sort', sortBy);

      const { data } = await API.get(`/transactions?${params.toString()}`);
      setTransactions(data.transactions || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [search, typeFilter, categoryFilter, sortBy]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await API.get('/transactions/analytics');
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchAnalytics();
  }, [fetchTransactions, fetchAnalytics]);

  // Handle Save / Edit Transaction
  const handleSaveTransaction = async (formData) => {
    try {
      if (editingTransaction) {
        await API.put(`/transactions/${editingTransaction._id}`, formData);
      } else {
        await API.post('/transactions', formData);
      }
      setShowForm(false);
      setEditingTransaction(null);
      fetchTransactions();
      fetchAnalytics();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save transaction');
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
      fetchAnalytics();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    try {
      const response = await API.get('/transactions/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingTransaction(null);
                setShowForm(!showForm);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-purple-200"
            >
              {showForm ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Transaction</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-8">
            {['Overview', 'Analytics', 'Reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-bold transition relative ${
                  activeTab === tab
                    ? 'text-purple-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards shown across tabs */}
        <SummaryCards summary={summary} />

        {/* Form Overlay / Inline */}
        {showForm && (
          <TransactionForm
            initialData={editingTransaction}
            onSave={handleSaveTransaction}
            onCancel={() => {
              setShowForm(false);
              setEditingTransaction(null);
            }}
          />
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div>
            <SearchBar search={search} setSearch={setSearch} />
            <FilterPanel
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <TransactionTable
              transactions={transactions}
              onEdit={(txn) => {
                setEditingTransaction(txn);
                setShowForm(true);
              }}
              onDelete={handleDeleteTransaction}
            />
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'Analytics' && (
          <Charts analyticsData={analyticsData} />
        )}

        {/* TAB 3: REPORTS */}
        {activeTab === 'Reports' && (
          <Reports />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
