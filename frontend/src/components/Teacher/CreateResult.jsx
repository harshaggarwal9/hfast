import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import { Toaster, toast } from "react-hot-toast";

export default function CreateResultForm() {
  const { user } = useAuthStore();
  const userId = user?._id;

  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [examName, setExamName] = useState("");
  const [exam, setExam] = useState(null);
  const [formData, setFormData] = useState({ rollNumber: "", marks: "" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examLoading, setExamLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`/api/teacher/fetch/${userId}`)
      .then(res => {
        setTeacherSubjects(res.data.subjects || []);
        setTeacherClasses(res.data.classes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const fetchExam = async () => {
    if (!examName || !selectedSubject || !selectedClass?.className || !selectedClass?.section) {
      toast.error("Please fill out all fields before fetching the exam.");
      return;
    }
    setExamLoading(true);
    try {
      const res = await axios.post("/api/exam/fetchExam", {
        name: examName,
        subject: selectedSubject,
        className: selectedClass.className,
        section: selectedClass.section,
      });
      if (res.data.success) {
        setExam(res.data.exam);
        toast.success("Exam fetched successfully!");
      } else {
        setExam(null);
        toast.error(res.data.message || "Failed to fetch exam");
      }
    } catch (err) {
      console.error(err);
      setExam(null);
      toast.error(err.response?.data?.message || "Failed to fetch exam");
    } finally {
      setExamLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddResult = e => {
    e.preventDefault();
    const newResult = {
      rollNumber: formData.rollNumber.trim(),
      marks: Number(formData.marks),
    };
    if (!newResult.rollNumber || isNaN(newResult.marks)) {
      toast.error("Please enter valid roll number and marks.");
      return;
    }
    if (results.find(r => r.rollNumber === newResult.rollNumber)) {
      toast.error("Roll number already added.");
      return;
    }
    setResults(prev => [...prev, newResult]);
    setFormData({ rollNumber: "", marks: "" });
  };

  const handleRemoveResult = rollNumber => {
    setResults(prev => prev.filter(r => r.rollNumber !== rollNumber));
  };

  const handleSaveAll = async () => {
    if (!exam || results.length === 0) {
      toast.error("No results to save.");
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all(
        results.map(r =>
          axios.post(`/api/result/create/${exam._id}`, {
            rollNumber: r.rollNumber,
            marks: r.marks,
            subjects: selectedSubject,
          })
        )
      );
      toast.success("All results saved successfully!");
      setResults([]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save results.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="card bg-base-100 shadow-md p-4 sm:p-6">
        <div className="card-body space-y-6">
          <h2 className="card-title text-2xl">Create Exam Result</h2>

          {/* Exam Info */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Exam Name</span></label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Enter exam name"
                value={examName}
                onChange={e => setExamName(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Select Subject</span></label>
              <select
                className="select select-bordered"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                <option disabled value="">Select subject</option>
                {teacherSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Select Class</span></label>
              <select
                className="select select-bordered"
                value={selectedClass ? `${selectedClass.className}-${selectedClass.section}` : ""}
                onChange={e => {
                  const [className, section] = e.target.value.split("-");
                  setSelectedClass({ className, section });
                }}
              >
                <option disabled value="">Select class</option>
                {teacherClasses.map(cls => (
                  <option key={`${cls.className}-${cls.section}`} value={`${cls.className}-${cls.section}`}>
                    {cls.className} - {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchExam}
              className={`btn btn-outline btn-primary w-full ${examLoading ? "loading" : ""}`}
              disabled={examLoading}
            >
              {examLoading ? "Fetching..." : "Fetch Exam"}
            </button>
          </div>

          {/* Result Entry */}
          {exam && (
            <>
              <form onSubmit={handleAddResult} className="grid sm:grid-cols-2 gap-4 border-t pt-4 mt-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Roll Number</span></label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Marks</span></label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                    min={0}
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn btn-outline btn-success w-full">
                    Add Student
                  </button>
                </div>
              </form>

              {/* Result List */}
              {results.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Students Added</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra text-sm">
                      <thead>
                        <tr>
                          <th>Roll Number</th>
                          <th>Marks</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map(({ rollNumber, marks }) => (
                          <tr key={rollNumber}>
                            <td>{rollNumber}</td>
                            <td>{marks}</td>
                            <td>
                              <button
                                className="btn btn-xs btn-error"
                                onClick={() => handleRemoveResult(rollNumber)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    className={`btn btn-primary w-full ${submitting ? "loading" : ""}`}
                    onClick={handleSaveAll}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save All"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
