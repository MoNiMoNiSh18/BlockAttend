import React, { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

function Dashboard() {
  const [account, setAccount] = useState("0xUSER12345");
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch attendance data from backend (instead of MetaMask)
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/student/attendance-summary`);
      const data = await res.json();

      setTotalClasses(data.totalClasses || 0);
      setAttendancePercent(data.attendancePercent || 0);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-6">
      <header className="w-full py-6 bg-gray-800 shadow-md text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-wide text-blue-400">
          BLOCKATTEND DASHBOARD
        </h1>
      </header>

      <div className="bg-gray-800 rounded-2xl p-8 shadow-xl text-center w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-green-400">Welcome!</h2>
        <p className="text-sm mb-2 text-gray-300 break-words">
          Blockchain ID: {account}
        </p>
        <div className="border-t border-gray-600 my-4"></div>
        {loading ? (
          <p className="text-gray-400">Fetching attendance data...</p>
        ) : (
          <>
            <p className="text-xl font-semibold">
              📚 Total Classes: {totalClasses}
            </p>
            <p className="text-xl font-semibold mt-2">
              ✅ Attendance: {attendancePercent}%
            </p>
          </>
        )}
        <button
          onClick={fetchAttendance}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition-all duration-300"
        >
          🔄 Refresh Data
        </button>
      </div>

      <footer className="mt-16 w-full text-center text-gray-400 text-sm">
        © 2025 BlockAttend
      </footer>
    </div>
  );
}

export default Dashboard;
