import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('https://mjerp.onrender.com', { withCredentials: true });

export default function GetNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/notification/get', {
          withCredentials: true,
        });
        setNotifs(data);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    })();

    socket.on('notification', (newNotif) => {
      setNotifs((prev) => [newNotif, ...prev]);
      toast.success(`New: ${newNotif.title}`);
    });

    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full py-10 text-white">
        <span className="loading loading-ball loading-lg text-primary"></span>
      </div>
    );

  if (!notifs.length)
    return (
      <div className="alert alert-info shadow-lg mt-6 mx-4 sm:mx-6 bg-slate-800 text-white">
        <div className="flex items-center gap-3">
          <Bell className="text-blue-400" size={24} />
          <span>No notifications available</span>
        </div>
      </div>
    );

  const gradientBorders = [
    'bg-gradient-to-br from-pink-500 to-red-500',
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-blue-400 to-cyan-500',
    'bg-gradient-to-br from-green-400 to-emerald-500',
    'bg-gradient-to-br from-yellow-400 to-amber-500',
    'bg-gradient-to-br from-fuchsia-500 to-rose-500',
    'bg-gradient-to-br from-sky-500 to-teal-500',
  ];

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white space-y-4">
      {notifs.map((n, idx) => {
        const borderGradient = gradientBorders[idx % gradientBorders.length];
        return (
          <div
            key={n._id}
            className="relative bg-white text-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className={`absolute top-0 left-0 h-full w-2 ${borderGradient}`} />

            <div className="p-4 pl-6 flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-3 sm:space-y-0">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg text-white self-start">
                <Bell size={24} />
              </div>

              <div className="flex-1">
                <h4 className="text-lg sm:text-xl font-semibold text-indigo-700 break-words">
                  {n.title}
                </h4>
                <p className="text-gray-700 mt-1 text-sm sm:text-base break-words">
                  {n.message}
                </p>
              </div>

              <div className="self-end sm:self-center px-3 py-1 text-xs rounded-xl shadow-md backdrop-blur-md bg-gradient-to-br from-purple-400/30 via-pink-300/30 to-yellow-200/30 border border-white/20 text-gray-900 font-semibold whitespace-nowrap">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
