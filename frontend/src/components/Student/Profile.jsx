import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import { User } from "lucide-react";

function ProfileSection() {
  const [profile, setProfile] = useState(null);
  const { user } = useAuthStore();
  const id = user?._id;

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/student/profile/${id}`)
      .then((res) => setProfile(res.data))
      .catch(console.error);
  }, [id]);

  if (!profile) {
    return <p className="text-gray-500 text-center mt-4">Loading profile...</p>;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-md sm:shadow-lg">
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <div className="bg-purple-200 p-3 rounded-full">
          <User size={32} className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {profile.userId.name}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Roll No: {profile.RollNumber}
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Class: {profile.classId.className} - {profile.classId.section}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm sm:text-base">
        <p className="text-gray-700">
          <span className="font-medium">Email:</span> {profile.userId.email}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Phone:</span> {profile.parent.phoneNumber}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Parent:</span> {profile.parent.userId.name}
        </p>
        {/* Add more fields here as needed */}
      </div>
    </div>
  );
}

export default ProfileSection;
