import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Local mock teacher data (can later be replaced by backend fetch)
  const teachers = [
    { id: 1, name: "Prof. Anitha", email: "anitha@college.in", password: "teach123" },
    { id: 2, name: "Prof. Kumar", email: "kumar@college.in", password: "teach123" },
    { id: 3, name: "Prof. Meena", email: "meena@college.in", password: "teach123" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const found = teachers.find(
      (t) => t.email === email && t.password === password
    );
    if (found) {
      navigate("/teacher-dashboard", { state: { teacher: found } });
    } else {
      alert("Invalid teacher credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-3xl mb-4 font-bold">Teacher Login</h2>
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-80"
      >
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded bg-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-700 py-2 rounded font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}
