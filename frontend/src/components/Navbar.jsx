import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Wallet, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-purple-200">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            Expense Tracker
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700">
              Hi, {user.name || 'User'}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
