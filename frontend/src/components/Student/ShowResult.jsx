import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudentResults() {
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const subjectsRes = await axios.get("/api/student/fetchSubjects");
        setSubjects(subjectsRes.data || []);

        const resultsRes = await axios.get("/api/result/fetch");
        setResults(resultsRes.data || []);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err.response?.data?.message ||
            "Failed to fetch subjects or results. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="alert alert-error shadow-lg max-w-md mx-auto my-8">
        <span>{errorMsg}</span>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="alert alert-warning shadow-lg max-w-md mx-auto my-8">
        <span>No subjects found for your profile.</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="alert alert-info shadow-lg max-w-md mx-auto my-8">
        <span>No results have been uploaded yet.</span>
      </div>
    );
  }

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
    <div className="space-y-8 px-4 sm:px-6 py-6">
      {examsArray.map(({ exam, results: resultList }) => {
        const submittedSubjectIds = new Set(
          resultList.map((r) => r.subject._id)
        );
        const missingSubjects = subjects.filter(
          (subj) => !submittedSubjectIds.has(subj._id)
        );

        return (
          <div
            key={exam._id}
            className="card bg-gray-800 text-gray-100 shadow-md sm:shadow-lg border border-gray-700"
          >
            <div className="card-body p-4 sm:p-6">
              {/* Exam Title */}
              <h2 className="card-title text-xl sm:text-2xl text-blue-400">
                {exam.name}
              </h2>

              {/* Missing subjects alert */}
              {missingSubjects.length > 0 && (
                <div className="alert bg-yellow-400 text-black mt-4 text-sm sm:text-base">
                  <span>
                    Marks not uploaded for:{" "}
                    {missingSubjects.map((s) => s.name).join(", ")}
                  </span>
                </div>
              )}

              {/* Table container */}
              <div className="overflow-x-auto mt-6">
                <table className="table w-full text-sm sm:text-base">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th>Subject</th>
                      <th className="text-center">Max Marks</th>
                      <th className="text-center">Marks Obtained</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {subjects.map((subj) => {
                      const resForSubj = resultList.find(
                        (r) => r.subject._id === subj._id
                      );
                      return (
                        <tr
                          key={subj._id}
                          className="hover:bg-gray-700 even:bg-gray-800"
                        >
                          <td className="py-3 px-2">{subj.name}</td>
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
