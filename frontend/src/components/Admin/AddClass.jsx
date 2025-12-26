import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;

export default function CreateClass() {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim() || !section.trim()) {
      return toast.error("Please provide both class name and section.");
    }
    setLoading(true);
    try {
      await axios.post("/api/class/create", {
        className: className.trim(),
        section: section.trim(),
      });
      toast.success("Class created successfully!");
      setClassName("");
      setSection("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto p-6 bg-base-100 shadow-lg rounded-lg w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Add New Class</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Class Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 10th Grade"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Section</span>
            </label>
            <input
              type="text"
              placeholder="e.g. A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control w-full">
            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
