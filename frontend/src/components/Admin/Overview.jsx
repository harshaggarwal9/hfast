import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Hourglass,
  BookOpen,
  Banknote,
} from "lucide-react";

const OverviewCard = ({ title, value, Icon, color }) => (
  <div className="bg-white rounded-2xl shadow-md p-4 flex items-center space-x-4 border w-full">
    <div className={`p-3 rounded-full ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-xl font-semibold text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

const Overview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalClasses: 0,
    totalFees: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userRes, pendingRes, classRes, feeRes] = await Promise.all([
          axios.get("/api/admin/totaluser"),
          axios.get("/api/admin/totalpendingusers"),
          axios.get("/api/admin/totalclasses"),
          axios.get("/api/admin/totalfees"),
        ]);
        setStats({
          totalUsers: userRes.data.count,
          pendingUsers: pendingRes.data.count,
          totalClasses: classRes.data.count,
          totalFees: feeRes.data.ans,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <OverviewCard title="Total Users" value={stats.totalUsers} Icon={Users} color="bg-blue-500" />
      <OverviewCard title="Pending Approvals" value={stats.pendingUsers} Icon={Hourglass} color="bg-yellow-500" />
      <OverviewCard title="Total Classes" value={stats.totalClasses} Icon={BookOpen} color="bg-green-500" />
      <OverviewCard title="Fees Collected" value={`₹${stats.totalFees}`} Icon={Banknote} color="bg-emerald-600" />
    </div>
  );
};

export default Overview;
