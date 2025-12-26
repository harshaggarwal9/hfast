import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar } from 'lucide-react';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const rowGradients = [
  'bg-gradient-to-r from-rose-100 to-teal-100',
  'bg-gradient-to-r from-green-100 to-yellow-100',
  'bg-gradient-to-r from-sky-100 to-pink-100',
  'bg-gradient-to-r from-indigo-100 to-blue-100',
  'bg-gradient-to-r from-purple-100 to-fuchsia-100',
  'bg-gradient-to-r from-orange-100 to-amber-100',
  'bg-gradient-to-r from-lime-100 to-emerald-100',
];

const TeacherTimeTable = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = async (day) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/timetable/getbyTeacher', { day });
      setSlots(response.data);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load timetable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDay);
  }, [selectedDay]);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl sm:text-3xl font-semibold">My Timetable</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <select
            className="select select-bordered bg-slate-800 border-blue-500 text-white text-sm sm:text-base"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day} className="text-black">
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-300">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-400">{error}</div>
      ) : slots.length === 0 ? (
        <div className="text-center text-gray-300">No slots for {selectedDay}.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl backdrop-blur-lg bg-white/10 p-4 shadow-xl">
          <table className="min-w-[600px] w-full table-auto border-separate border-spacing-y-3">
            <thead>
              <tr className="text-sm sm:text-base bg-gradient-to-r from-purple-500 to-indigo-500 text-white uppercase tracking-wider rounded-t-xl">
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left rounded-l-xl">Subject</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">Class</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">Section</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left">Time</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left rounded-r-xl">Day</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, index) => {
                const gradientClass = rowGradients[index % rowGradients.length];
                return (
                  <tr
                    key={slot._id || index}
                    className={`text-gray-900 ${gradientClass} hover:scale-[1.02] hover:shadow-lg transition-all duration-200 rounded-xl`}
                  >
                    <td className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">{slot.subject.name}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{slot.class.className}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{slot.class.section}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{slot.day}</td>
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

export default TeacherTimeTable;
