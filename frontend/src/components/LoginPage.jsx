import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      const user = useAuthStore.getState().user;
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher");
      } else if (user.role === "student") {
        navigate("/student");
      } else if (user.role === "parent") {
        navigate("/parent");
      } else {
        navigate("/");
      }
    }
  };

  return (
   <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-black px-4 sm:px-6 lg:px-8">
    <form
        onSubmit={handleSubmit}
       className="card w-full max-w-md sm:max-w-lg shadow-2xl bg-base-100 p-6 sm:p-10 space-y-6 sm:space-y-8 rounded-xl ring-1 ring-gray-800"

      >
       <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-primary drop-shadow-md mb-4">
          Login
        </h2>

        <div className="form-control">
          <label htmlFor="email" className="label mb-1">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            className="input input-bordered w-full"
            required
            autoComplete="on"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="password" className="label mb-1">
            <span className="label-text font-medium">Password</span>
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            className="input input-bordered w-full"
            required
            autoComplete="on"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
