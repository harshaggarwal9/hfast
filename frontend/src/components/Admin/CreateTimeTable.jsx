import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";

axios.defaults.withCredentials = true;

export default function CreateSlot() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          axios.get("/api/teacher/fetch"),
          axios.get("/api/class/fetch"),
        ]);
        setTeachers(tRes.data.data);
        setClasses(cRes.data.data);
      } catch (err) {
        toast.error("Failed to load teachers or classes.");
        console.error(err);
      }
    })();
  }, []);

  const teacherObj = teachers.find((t) => t._id === selectedTeacher) || null;
  const filteredClasses = teacherObj
    ? classes.filter((c) => teacherObj.classes?.includes(c._id))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedTeacher ||
      !selectedClass ||
      !selectedSubject ||
      !day ||
      !startTime ||
      !endTime
    ) {
      return toast.error("Please fill in all fields.");
    }
    if (startTime >= endTime) {
      return toast.error("Start time must be before end time.");
    }

    try {
      await axios.post(`/api/timetable/create/${selectedTeacher}`, {
        classId: selectedClass,
        subject: selectedSubject,
        day,
        startTime,
        endTime,
      });
      toast.success("✅ Slot created successfully");
      setSelectedTeacher("");
      setSelectedClass("");
      setSelectedSubject("");
      setDay("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create slot.");
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto px-3 sm:px-4 py-4 bg-indigo-50 shadow-md rounded-lg">
      <h1 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-4 flex items-center space-x-2">
        <Calendar size={24} />
        <span>Create Timetable Slot</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-3">
        {/* Teacher Select */}
        <div className="form-control w-full">
          <label className="label p-0 mb-1">
            <span className="label-text text-indigo-600 flex items-center text-sm">
              <User size={14} className="mr-1" /> Teacher
            </span>
          </label>
          <select
            className="select select-bordered w-full bg-indigo-100 text-indigo-800"
            value={selectedTeacher}
            onChange={(e) => {
              setSelectedTeacher(e.target.value);
              setSelectedClass("");
              setSelectedSubject("");
            }}
          >
            <option value="">Select a teacher…</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.userId.name} ({t.userId.email})
              </option>
            ))}
          </select>
        </div>

        {/* Class Select */}
        <div className="form-control w-full">
          <label className="label p-0 mb-1">
            <span className="label-text text-indigo-600 flex items-center text-sm">
              <BookOpen size={14} className="mr-1" /> Class
            </span>
          </label>
          <select
            className="select select-bordered w-full bg-indigo-100 text-indigo-800"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!selectedTeacher}
          >
            <option value="">
              {selectedTeacher ? "Select a class…" : "Select teacher first"}
            </option>
            {filteredClasses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className} — Section {c.section}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Select */}
        <div className="form-control w-full">
          <label className="label p-0 mb-1">
            <span className="label-text text-indigo-600 flex items-center text-sm">
              <BookOpen size={14} className="mr-1" /> Subject
            </span>
          </label>
          <select
            className="select select-bordered w-full bg-indigo-100 text-indigo-800"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedTeacher}
          >
            <option value="">
              {selectedTeacher ? "Select a subject…" : "Select teacher first"}
            </option>
            {teacherObj?.subjects?.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Day Select */}
        <div className="form-control w-full">
          <label className="label p-0 mb-1">
            <span className="label-text text-indigo-600 flex items-center text-sm">
              <Calendar size={14} className="mr-1" /> Day
            </span>
          </label>
          <select
            className="select select-bordered w-full bg-indigo-100 text-indigo-800"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            <option value="">Select a day…</option>
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Time Inputs - Responsive */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
          <div className="form-control w-full">
            <label className="label p-0 mb-1">
              <span className="label-text text-indigo-600 flex items-center text-sm">
                <Clock size={14} className="mr-1" /> Start Time
              </span>
            </label>
            <input
              type="time"
              className="input input-bordered w-full bg-indigo-100 text-indigo-800"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="form-control w-full">
            <label className="label p-0 mb-1">
              <span className="label-text text-indigo-600 flex items-center text-sm">
                <Clock size={14} className="mr-1" /> End Time
              </span>
            </label>
            <input
              type="time"
              className="input input-bordered w-full bg-indigo-100 text-indigo-800"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-accent w-full flex items-center justify-center space-x-2 py-2"
        >
          <CheckCircle2 />
          <span>Create Slot</span>
        </button>
      </form>
    </div>
  );
}
