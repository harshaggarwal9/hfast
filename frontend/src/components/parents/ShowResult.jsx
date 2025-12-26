import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

export default function ShowResult() {
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useAuthStore();
  const id = user?._id;

  useEffect(() => {
    const fetchChildrenFromProfile = async () => {
      try {
        if (!id) return;
        const res = await axios.get(`/api/parent/fetch/${id}`);
        setChildren(res.data.childrens || []);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load student list");
      }
    };

    fetchChildrenFromProfile();
  }, [id]);

  useEffect(() => {
    if (!selectedStudent) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const [subjectRes, resultRes] = await Promise.all([
          axios.post("/api/parent/subjects", { id: selectedStudent }),
          axios.post("/api/parent/results", { id: selectedStudent }),
        ]);

        setSubjects(subjectRes.data || []);
        setResults(resultRes.data || []);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err.response?.data?.message ||
            "Failed to fetch data for selected student"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStudent]);

  const examsMap = {};
  results.forEach((r) => {
    const examId = r.exam._id;
    if (!examsMap[examId]) {
      examsMap[examId] = { exam: r.exam, results: [] };
    }
    examsMap[examId].results.push(r);
  });
  const examsArray = Object.values(examsMap);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 md:px-12">
      {/* Dropdown */}
      <div className="mb-6 max-w-xl mx-auto">
        <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
          Select Student:
        </label>
        {Array.isArray(children) && children.length > 0 ? (
          <select
            className="select w-full bg-gradient-to-r from-blue-500 to-green-400 text-white border-none focus:outline-none focus:ring-2 focus:ring-green-300"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Select a Student --</option>
            {children.map((child) => (
              <option key={child._id} value={child._id}>
                {child.userId?.name || "Unnamed Student"}
              </option>
            ))}
          </select>
        ) : (
          <div className="alert alert-warning">No student list available.</div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="alert alert-error shadow-lg max-w-xl mx-auto">
          <span>{errorMsg}</span>
        </div>
      )}

      {!selectedStudent && (
        <div className="alert alert-info shadow max-w-xl mx-auto">
          <span>Please select a student to view their results.</span>
        </div>
      )}

      {!loading && selectedStudent && subjects.length === 0 && (
        <div className="alert alert-warning shadow max-w-xl mx-auto">
          <span>No subjects found for this student.</span>
        </div>
      )}

      {!loading && selectedStudent && results.length === 0 && (
        <div className="alert alert-info shadow max-w-xl mx-auto">
          <span>No results uploaded yet for this student.</span>
        </div>
      )}

      {!loading &&
        selectedStudent &&
        subjects.length > 0 &&
        results.length > 0 &&
        examsArray.map(({ exam, results: resultList }) => {
          const submittedSubjectIds = new Set(
            resultList.map((r) => r.subject._id)
          );
          const missingSubjects = subjects.filter(
            (s) => !submittedSubjectIds.has(s._id)
          );

          return (
            <div
              key={exam._id}
              className="card bg-gradient-to-br from-indigo-800 via-purple-800 to-blue-800 text-white shadow-lg border border-indigo-700 max-w-4xl mx-auto"
            >
              <div className="card-body">
                <h2 className="card-title text-lg sm:text-xl text-yellow-300">
                  {exam.name}
                </h2>

                {missingSubjects.length > 0 && (
                  <div className="alert bg-yellow-400 text-black mt-4">
                    <span>
                      Marks not uploaded for:{" "}
                      {missingSubjects.map((s) => s.name).join(", ")}
                    </span>
                  </div>
                )}

                <div className="overflow-x-auto mt-4">
                  <table className="table w-full text-white text-sm sm:text-base">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th>Subject</th>
                        <th className="text-center">Max Marks</th>
                        <th className="text-center">Marks Obtained</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subj) => {
                        const resForSubj = resultList.find(
                          (r) => r.subject._id === subj._id
                        );
                        return (
                          <tr
                            key={subj._id}
                            className="hover:bg-indigo-700 even:bg-indigo-900"
                          >
                            <td>{subj.name}</td>
                            <td className="text-center">
                              {exam.marks ?? "—"}
                            </td>
                            <td className="text-center">
                              {resForSubj ? resForSubj.marks : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
