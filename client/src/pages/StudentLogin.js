import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Local mock data (merged from deleted data/students.js)
  const students = [
    { id: 1, name: "John Doe", email: "john@student.com", password: "12345" },
    { id: 2, name: "Jane Smith", email: "jane@student.com", password: "12345" },
    { id: 3, name: "Arun Kumar", email: "arun@student.com", password: "12345" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const found = students.find(
      (s) => s.email === email && s.password === password
    );
    if (found) {
      navigate("/student-dashboard", { state: { student: found } });
    } else {
      alert("Invalid student credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-3xl mb-4 font-bold">Student Login</h2>
      <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded bg-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-purple-500 hover:bg-purple-700 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
