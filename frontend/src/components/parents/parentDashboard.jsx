import { useState } from "react";
import axios from "axios";
import {
  User,
  CreditCard,
  FileText,
  Bell,
  LogOutIcon,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileSection from "./profile";
import FeePayment from "./Fees";
import GetNotifications2 from "../getNotification2";
import { toast } from "react-hot-toast";
import ShowResult from "./ShowResult.jsx";

export default function ParentDashboard() {
  const navigate = useNavigate();

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "fees", label: "Fee Payment", icon: <CreditCard size={18} /> },
    { id: "results", label: "Show Result", icon: <FileText size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "log-out", label: "Log-out", icon: <LogOutIcon size={18} /> },
  ];

  const [activeTab, setActiveTab] = useState("profile");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    axios.post('/api/auth/logout', {}, { withCredentials: true });
    toast.success("Logged out successfully");
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "fees":
        return <FeePayment />;
      case "results":
        return <ShowResult />;
      case "notifications":
        return <GetNotifications2 />;
      case "log-out":
        window.logout_modal.showModal();
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Mobile Nav Toggle */}
      <div className="md:hidden flex justify-between items-center bg-green-600 text-white px-4 py-3 shadow-md">
        <h2 className="text-lg font-semibold">Parent Dashboard</h2>
        <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          menuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-gradient-to-b from-green-600 to-blue-500 text-white md:h-full shadow-lg z-10`}
      >
        <div className="p-4 border-b border-blue-300 md:block">
          <h2 className="text-2xl font-bold hidden md:block">Parent Dashboard</h2>
        </div>
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg transition-all
                ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-green-500 text-white"
                }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8 overflow-auto">
        {renderContent()}
      </main>

      {/* Logout Modal */}
      <dialog id="logout_modal" className="modal">
        <div className="modal-box bg-gradient-to-br from-green-700 via-blue-800 to-blue-600 text-white shadow-2xl border border-blue-500">
          <h3 className="font-bold text-lg">Confirm Logout</h3>
          <p className="py-4">Are you sure you want to log out?</p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn bg-gray-700 hover:bg-gray-600 text-white border-none">
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
    </div>
  );
}
