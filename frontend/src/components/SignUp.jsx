import React, { useState } from "react";
import useAuthStore from "../stores/useAuthStore.js";
import { Link } from "react-router-dom";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const { signup, loading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(name, email, password, role);

    // Reset form
    setName("");
    setEmail("");
    setPassword("");
    setRole("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-black px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md shadow-xl bg-base-100 p-6 sm:p-8 space-y-5 rounded-lg"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-2">
          Sign Up
        </h2>

        <div className="form-control">
          <label htmlFor="name" className="label">
            <span className="label-text font-medium">Name</span>
          </label>
          <input
            type="text"
            id="name"
            placeholder="Your full name"
            className="input input-bordered w-full text-sm"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="email" className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            className="input input-bordered w-full text-sm"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="password" className="label">
            <span className="label-text font-medium">Password</span>
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            className="input input-bordered w-full text-sm"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="role" className="label">
            <span className="label-text font-medium">Role</span>
          </label>
          <select
            id="role"
            className="select select-bordered w-full text-sm"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled>
              Select a role
            </option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-md w-full mt-2"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <Link
          to="/"
          className="text-blue-600 hover:underline text-center block text-sm"
        >
          Already have an account?
        </Link>
      </form>
    </div>
  );
}

export default SignUp;
