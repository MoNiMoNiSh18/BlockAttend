import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password, "student");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/student-dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      {/* Outer neon border */}
      <div className="p-[2px] rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
        {/* Glass card */}
        <div className="bg-neutral-900/80 backdrop-blur-xl px-8 py-10 rounded-2xl w-full max-w-md border border-neutral-700/40 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
              Student Login
            </h1>
          </div>

          {error && (
            <div className="bg-red-900/30 text-red-300 p-4 rounded-lg mb-6 border border-red-700/40 text-sm shadow">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:scale-[1.02] hover:from-purple-500 hover:to-purple-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
