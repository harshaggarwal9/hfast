import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, CalendarDays } from 'lucide-react';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const rowGradients = [
  'bg-gradient-to-r from-purple-100 via-pink-100 to-white',
  'bg-gradient-to-r from-cyan-100 via-blue-100 to-white',
  'bg-gradient-to-r from-yellow-100 via-orange-100 to-white',
  'bg-gradient-to-r from-green-100 via-lime-100 to-white',
  'bg-gradient-to-r from-indigo-100 via-violet-100 to-white',
  'bg-gradient-to-r from-rose-100 via-fuchsia-100 to-white',
  'bg-gradient-to-r from-emerald-100 via-teal-100 to-white',
];

const StudentTimeTable = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = async (day) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/timetable/getbyClass', { day });
      setSlots(response.data);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDay);
  }, [selectedDay]);

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl md:text-3xl font-bold text-purple-800">My Class Timetable</h2>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-gray-600" />
          <select
            className="select select-bordered select-accent w-full md:w-44"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center text-gray-500">Loading timetable...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : slots.length === 0 ? (
        <div className="text-center text-gray-500">
          No slots scheduled for <span className="font-medium">{selectedDay}</span>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg backdrop-blur bg-white/30 p-2 md:p-4">
          <table className="min-w-full table-auto border-separate border-spacing-y-3 text-sm md:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-pink-500 to-purple-500 text-white uppercase text-xs md:text-sm tracking-wider rounded-t-xl">
                <th className="px-4 py-3 text-left rounded-l-xl">Subject</th>
                <th className="px-4 py-3 text-left">Teacher</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left rounded-r-xl">Day</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, index) => {
                const gradientClass = rowGradients[index % rowGradients.length];
                return (
                  <tr
                    key={slot._id || index}
                    className={`text-gray-800 transition-all duration-200 hover:scale-[1.015] hover:shadow-lg rounded-xl ${gradientClass}`}
                  >
                    <td className="px-4 py-3 font-semibold">{slot.subject.name}</td>
                    <td className="px-4 py-3">{slot.teacher.userId.name}</td>
                    <td className="px-4 py-3">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="px-4 py-3">{slot.day}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentTimeTable;
