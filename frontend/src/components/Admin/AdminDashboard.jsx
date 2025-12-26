import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Menu, X } from "lucide-react";

const tabs = [
  { label: "Overview", path: "overview" },
  { label: "User Approval", path: "user-approval" },
  { label: "Teacher Assignment", path: "teacher-assignment" },
  { label: "Fee Management", path: "fee-management" },
  { label: "Create Notifications", path: "notifications" },
  { label: "Add Subject", path: "add-subject" },
  { label: "Add Class", path: "add-class" },
  { label: "Create Slot", path: "create-timetable" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    axios.post("/api/auth/logout", {}, { withCredentials: true });
    toast.success("Logged out successfully");
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className="p-4 sm:p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Admin Dashboard
        </h1>
        <button
          className="sm:hidden p-2"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Tabs (Desktop) */}
      <div className="hidden sm:flex flex-wrap gap-4 border-b mb-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-all"
        >
          Log-out
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-2 border rounded-md p-3 mb-4 shadow-lg bg-white z-10">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `px-2 py-2 text-sm font-medium rounded transition-all ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
              onClick={() => setMenuOpen(false)} // Close menu on tab select
            >
              {tab.label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setShowLogoutModal(true);
              setMenuOpen(false);
            }}
            className="text-red-600 hover:bg-red-100 rounded px-2 py-2 text-sm font-medium text-left"
          >
            Log-out
          </button>
        </div>
      )}

      {/* Page content */}
      <Outlet />

      {/* Logout Modal */}
      {showLogoutModal && (
        <dialog open className="modal">
          <div className="modal-box bg-white text-gray-800 shadow-xl border border-gray-300">
            <h3 className="font-bold text-lg">Confirm Logout</h3>
            <p className="py-4">Are you sure you want to log out?</p>
            <div className="modal-action flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                className="btn bg-gray-200 text-black border-none w-full sm:w-auto"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 text-white border-none w-full sm:w-auto"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default AdminDashboard;
