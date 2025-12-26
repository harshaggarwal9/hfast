import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;

export default function CreateSubject() {
  const [name, setName] = useState("");
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/class/fetch");
        setAllClasses(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes");
      }
    })();
  }, []);

  const handleClassChange = (e) => {
    const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedClasses(opts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || selectedClasses.length === 0) {
      return toast.error("Please enter a subject name and select at least one class.");
    }

    setLoading(true);
    try {
      const payload = { name: name.trim(), classes: selectedClasses };
      await axios.post("/api/subject/create", payload);
      toast.success("Subject created successfully!");
      setName("");
      setSelectedClasses([]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto p-6 bg-base-100 shadow-lg rounded-lg w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Add New Subject</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Name */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Subject Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mathematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Class Multi-Select */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Assign to Classes</span>
            </label>
            <select
              multiple
              value={selectedClasses}
              onChange={handleClassChange}
              className="select select-bordered w-full h-40 sm:h-32 overflow-auto"
              required
            >
              {allClasses.map((c) => (
                <option key={c._id} value={c.className}>
                  {c.className} — Section {c.section}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt text-sm text-gray-500">
                Hold <kbd className="kbd kbd-xs">Ctrl</kbd> / <kbd className="kbd kbd-xs">⌘</kbd> to select multiple.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="form-control w-full">
            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
