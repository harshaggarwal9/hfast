import { useState } from "react";
import axios from "axios";
import {
  User,
  CalendarClock,
  FileText,
  Bell,
  LogOutIcon,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileSection from "./Profile";
import StudentTimeTable from "./TimeTable";
import StudentResults from "./ShowResult";
import GetNotifications2 from "../getNotification2";
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "timetable", label: "Time Table", icon: <CalendarClock size={18} /> },
    { id: "results", label: "Show Result", icon: <FileText size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "logout", label: "Logout", icon: <LogOutIcon size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "timetable":
        return <StudentTimeTable />;
      case "results":
        return <StudentResults />;
      case "notifications":
        return <GetNotifications2 />;
      case "logout":
        window.logout_modal.showModal();
        return null;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    axios.post('/api/auth/logout', {}, { withCredentials: true });
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Top Bar (Mobile only) */}
      <div className="md:hidden flex justify-between items-center bg-purple-600 text-white px-4 py-3 shadow-md">
        <h2 className="text-xl font-bold">Student Dashboard</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="focus:outline-none">
          {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-full md:w-64 bg-gradient-to-b from-purple-600 to-pink-500 shadow-lg text-white flex-col z-20
          ${sidebarOpen ? 'flex' : 'hidden'} md:flex absolute md:relative md:h-full`}
      >
        <div className="p-6 border-b border-pink-300 hidden md:block">
          <h2 className="text-2xl font-bold">Student Dashboard</h2>
        </div>
        <nav className="flex-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false); // auto-close on mobile
              }}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg mb-3 transition-colors
                ${
                  activeTab === tab.id
                    ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                    : "hover:bg-purple-500 text-white"
                }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-pink-50 to-purple-50 p-4 sm:p-6 overflow-auto">  {renderContent()}
      </main>

      {/* Logout Modal */}
      <dialog id="logout_modal" className="modal">
        <div className="modal-box bg-gradient-to-br from-slate-900 via-purple-900 to-purple-700 text-white shadow-2xl border border-purple-500">
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
