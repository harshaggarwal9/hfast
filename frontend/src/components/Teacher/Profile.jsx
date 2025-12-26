import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const { user } = useAuthStore();
  const id = user?._id;

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/teacher/fetch/${id}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Error fetching profile:", err));
  }, [id]);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <User size={40} className="sm:size-12" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {profile.userId?.name || 'No Name'}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              {profile.userId?.email || 'No Email'}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 bg-gray-50">
          {/* Subjects */}
          <div className="bg-blue-100 text-blue-900 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-blue-700">Subjects</h4>
            <p className="text-base sm:text-lg font-semibold mt-1">
              {Array.isArray(profile.subjects) && profile.subjects.length > 0
                ? profile.subjects.join(", ")
                : 'N/A'}
            </p>
          </div>

          {/* Experience */}
          <div className="bg-yellow-100 text-yellow-900 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-yellow-700">Experience</h4>
            <p className="text-base sm:text-lg font-semibold mt-1">
              {typeof profile.experience === 'number'
                ? `${profile.experience} ${profile.experience > 1 ? 'years' : 'year'}`
                : 'N/A'}
            </p>
          </div>

          {/* Qualifications */}
          <div className="sm:col-span-2 bg-green-100 text-green-900 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-green-700">Qualifications</h4>
            <p className="text-base sm:text-lg font-semibold mt-1">
              {profile.qualification || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
