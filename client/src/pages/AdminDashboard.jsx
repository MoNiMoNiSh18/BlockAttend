// client/src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState({});

  // NEW STATES
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const requests = JSON.parse(localStorage.getItem("pendingRequests") || "[]");
    setPendingRequests(requests);

    fetchCounts();
    fetchLowAttendance();
  }, [refreshKey]);

  // ✅ FETCH TEACHER + STUDENT COUNT
  async function fetchCounts() {
    try {
      const tRes = await fetch("/api/admin/teachers-count");
      const tData = await tRes.json();
      setTotalTeachers(tData.count || 0);

      const sRes = await fetch("/api/admin/students-count");
      const sData = await sRes.json();
      setTotalStudents(sData.count || 0);
    } catch (err) {
      console.error("Failed fetching counts:", err);
    }
  }

  // LOW ATTENDANCE
  async function fetchLowAttendance() {
    try {
      const res = await fetch("/api/admin/low-attendance-students");
      const data = await res.json();
      setLowAttendanceStudents(data || {});
    } catch (e) {
      console.error("Failed to fetch low attendance students:", e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const approveRequest = async (id) => {
    const approved = pendingRequests.find(r => r.id === id);
    if (!approved) return alert("Request not found");

    const payload = {
      id: approved.id,
      name: approved.name,
      email: approved.email,
      role: approved.role,
      className: approved.className || "",
      password: approved.password || "changeMe123",
    };

    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Approval failed");
      }

      const updated = pendingRequests.filter(r => r.id !== id);
      setPendingRequests(updated);
      localStorage.setItem("pendingRequests", JSON.stringify(updated));

      setRefreshKey(k => k + 1);
      alert("Approved successfully!");
    } catch (e) {
      console.error("Approve failed:", e);
      alert("Approve failed: " + e.message);
    }
  };

  const rejectRequest = (id) => {
    const updated = pendingRequests.filter(r => r.id !== id);
    setPendingRequests(updated);
    localStorage.setItem("pendingRequests", JSON.stringify(updated));
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-white">
    <nav className="backdrop-blur-md bg-neutral-900/60 border-b border-neutral-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text drop-shadow">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">{user?.name}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-6 py-2 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-red-700/30"
        >
          Logout
        </button>
      </div>
    </nav>

    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14">
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl shadow hover:shadow-purple-900/20 transition-all duration-300">
          <p className="text-gray-400 text-sm">Pending Requests</p>
          <p className="text-4xl font-extrabold mt-2">{pendingRequests.length}</p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl shadow hover:shadow-blue-900/20 transition-all duration-300">
          <p className="text-gray-400 text-sm">Total Teachers</p>
          <p className="text-4xl font-extrabold mt-2">{totalTeachers}</p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl shadow hover:shadow-green-900/20 transition-all duration-300">
          <p className="text-gray-400 text-sm">Total Students</p>
          <p className="text-4xl font-extrabold mt-2">{totalStudents}</p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl shadow hover:shadow-emerald-900/20 transition-all duration-300">
          <p className="text-gray-400 text-sm">System Status</p>
          <p className="text-4xl font-extrabold mt-2 text-green-400">Active</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-neutral-900/70 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 mb-10 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-purple-300 tracking-wide">
          Registration Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg italic">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-neutral-800/60 border border-neutral-700 backdrop-blur-xl rounded-xl p-6 flex justify-between items-center hover:bg-neutral-800/80 transition-all duration-300"
              >
                <div>
                  <p className="font-bold text-lg text-white">{req.name}</p>
                  <p className="text-gray-400">{req.email}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Role: <span className="capitalize text-purple-300">{req.role}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => approveRequest(req.id)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 transition-all duration-300 rounded-xl shadow hover:shadow-green-700/30"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 transition-all duration-300 rounded-xl shadow hover:shadow-red-700/30"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Attendance Section */}
      <div className="bg-neutral-900/70 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-red-300 tracking-wide">
          Students with Low Attendance (&lt; 75%)
        </h2>

        {Object.keys(lowAttendanceStudents).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg italic">No students with low attendance</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(lowAttendanceStudents).map((cls) => (
              <div
                key={cls}
                className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-xl shadow-sm"
              >
                <h3 className="text-lg font-bold text-yellow-400 mb-4">
                  Class {cls}
                </h3>

                <div className="space-y-3">
                  {lowAttendanceStudents[cls].map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-900/60 p-4 border border-neutral-700 rounded-xl hover:bg-neutral-900/80 transition-all duration-300"
                    >
                      <div>
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-sm text-gray-400">{s.email}</div>
                        <div className="text-sm text-red-400 mt-1">
                          Attendance: {s.attendancePercentage}% ({s.presentDays}/{s.totalDays})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
}