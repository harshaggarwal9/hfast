import React, { useState } from "react";
import axios from "axios";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  User,
  Clock,
  FileText,
  CheckSquare,
  Bell,
  LogOutIcon,
  Menu,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

const tabs = [
  { label: "Profile", path: "profile", icon: <User className="inline mr-1" /> },
  { label: "Time Table", path: "Show-Timetable", icon: <Clock className="inline mr-1" /> },
  { label: "Create Exam", path: "create-exam", icon: <FileText className="inline mr-1" /> },
  { label: "Create Result", path: "create-result", icon: <CheckSquare className="inline mr-1" /> },
  { label: "Notifications", path: "notifications", icon: <Bell className="inline mr-1" /> },
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    axios.post('/api/auth/logout', {}, { withCredentials: true });
    toast.success("Logged out successfully");
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 py-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Teacher Dashboard</h1>
        <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:flex flex-wrap gap-3 border-b border-slate-400 mb-6 overflow-x-auto pb-2">
        {tabs.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex-shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium flex items-center rounded-md transition-all duration-200 ${
                isActive
                  ? "border-b-2 border-blue-400 text-blue-300"
                  : "text-slate-300 hover:text-white"
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex-shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium flex items-center text-red-500 hover:text-red-600 transition-all"
        >
          <LogOutIcon className="inline mr-1" />
          Log-out
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-2 mb-6 border border-slate-700 p-3 rounded-lg bg-slate-800 shadow-lg z-10">
          {tabs.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 text-sm font-medium rounded transition-all ${
                  isActive
                    ? "bg-blue-900 text-blue-300"
                    : "text-white hover:bg-slate-700"
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {icon}
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setShowLogoutModal(true);
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 text-sm px-2 py-2"
          >
            <LogOutIcon size={16} />
            Log-out
          </button>
        </div>
      )}

      {/* Page Content */}
      <div className="w-full">
        <Outlet />
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <dialog open className="modal">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white shadow-2xl border border-slate-700">
            <h3 className="font-bold text-lg">Confirm Logout</h3>
            <p className="py-4">Are you sure you want to log out?</p>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2 flex-wrap">
                <button
                  className="btn bg-gray-700 hover:bg-gray-600 text-white border-none"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn bg-red-600 hover:bg-red-700 text-white border-none"
                  onClick={handleLogout}
                >
                  Yes, Logout
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
