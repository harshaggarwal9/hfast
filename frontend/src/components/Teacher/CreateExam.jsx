import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

export default function CreateExamForm() {
  const { user } = useAuthStore();
  const userId = user?._id;

  const [teacher, setTeacher] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    marks: "",
    subject: "",
    classes: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/teacher/fetch/${userId}`)
      .then(res => setTeacher(res.data))
      .catch(err => console.error("Error loading teacher:", err))
      .finally(() => setLoadingTeacher(false));
  }, [userId]);

  const subjectOptions = teacher?.subjects || [];
  const classOptions = teacher?.classes || [];

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiChange = classId => {
    setFormData(prev => {
      const setVals = new Set(prev.classes);
      if (setVals.has(classId)) setVals.delete(classId);
      else setVals.add(classId);
      return { ...prev, classes: Array.from(setVals) };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await axios.post("/api/exam/create", {
        name: formData.name,
        date: formData.date,
        marks: Number(formData.marks),
        subject: formData.subject,
        classes: formData.classes
      });
      setMessage({ type: "success", text: "Exam created successfully!" });
      setFormData({ name: "", date: "", marks: "", subject: "", classes: [] });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "Error creating exam" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTeacher) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!teacher) {
    return <p className="text-center text-red-500">Unable to load teacher data.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body space-y-6">
          <h2 className="card-title text-2xl text-center md:text-left">Create New Exam</h2>

          {message && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Exam Name */}
            <div className="form-control">
              <label className="label"><span className="label-text">Exam Name</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                placeholder="Enter exam name"
                required
              />
            </div>

            {/* Date & Marks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Date</span></label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Total Marks</span></label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="Max marks"
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div className="form-control">
              <label className="label"><span className="label-text">Subject</span></label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>Select subject</option>
                {subjectOptions.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Classes */}
            <div className="form-control">
              <label className="label"><span className="label-text">Classes</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto border rounded p-3">
                {classOptions.map(c => (
                  <label key={c._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.classes.includes(c._id)}
                      onChange={() => handleMultiChange(c._id)}
                      className="checkbox checkbox-secondary"
                    />
                    {`${c.className} ${c.section}`}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="form-control mt-4">
              <button
                type="submit"
                className={`btn btn-primary w-full ${submitting ? "loading" : ""}`}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Exam"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
