// client/src/pages/StudentDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRecords, setModalRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (user && user.email) fetchAttendance(user.email);
    // eslint-disable-next-line
  }, [user]);

  async function fetchAttendance(email) {
    try {
      const resp = await fetch(`/api/student/attendance/${encodeURIComponent(email)}`);
      const data = await resp.json();
      const map = {};
      (data || []).forEach((r) => {
        if (r.date) map[r.date] = r.present;
      });
      setAttendanceMap(map);
    } catch (e) {
      console.error("Failed to fetch attendance", e);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
  function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  function generateCalendarDays() {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(i).padStart(2, "0")}`;
      days.push({
        day: i,
        date: dateStr,
        present: attendanceMap[dateStr] !== undefined ? attendanceMap[dateStr] : null,
      });
    }
    return days;
  }

  const calendarDays = generateCalendarDays();
  const monthYear = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const totalDays = Object.keys(attendanceMap).length;
  const presentDays = Object.values(attendanceMap).filter(Boolean).length;
  const attendancePercent = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">
      {/* Top Navbar */}
      <nav className="backdrop-blur-md bg-neutral-900/40 border-b border-neutral-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-sm text-gray-400">{user?.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-semibold shadow-md hover:shadow-red-700/40 hover:scale-105 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[ 
            { label: "Days Present", value: presentDays },
            { label: "Days Absent", value: Math.max(0, totalDays - presentDays) },
            {
              label: "Attendance %",
              value: attendancePercent + "%",
              className: "text-blue-400",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              <p className="text-gray-400 text-sm">{item.label}</p>
              <p className={`text-4xl font-extrabold mt-2 ${item.className || ""}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Low Attendance Warning */}
        {attendancePercent < 75 && (
          <div className="mb-8 p-5 bg-red-900/40 border border-red-600/60 rounded-xl shadow-red-700/20 shadow-md flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-1">Attendance Alert</h3>
              <p className="text-red-300">
                Your attendance is below 75% ({attendancePercent}%). Please contact your teacher.
              </p>
            </div>
          </div>
        )}

        {/* Calendar Box */}
        <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Attendance Calendar</h2>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                }
                className="px-4 py-2 bg-neutral-800/70 rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-all"
              >
                ← Prev
              </button>

              <span className="px-4 py-2 bg-neutral-800/70 rounded-xl border border-neutral-700">
                {monthYear}
              </span>

              <button
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                }
                className="px-4 py-2 bg-neutral-800/70 rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-all"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center font-bold text-gray-400 py-2">
                {d}
              </div>
            ))}

            {calendarDays.map((day, i) => {
              if (!day)
                return (
                  <div key={i} className="aspect-square">
                    <div className="w-full h-full bg-neutral-900/30 rounded-xl"></div>
                  </div>
                );

              const color =
                day.present === null
                  ? "bg-neutral-800/60 text-gray-400 border border-neutral-700"
                  : day.present
                  ? "bg-green-700/80 border border-green-500/40 text-white shadow-green-600/20"
                  : "bg-red-700/80 border border-red-500/40 text-white shadow-red-600/20";

              return (
                <div
                  key={i}
                  className="aspect-square cursor-pointer transition-all"
                  onClick={async () => {
                    try {
                      const resp = await fetch(
                        `/api/student/attendance/${encodeURIComponent(user.email)}`
                      );
                      const data = await resp.json();
                      setModalRecords(data.filter((r) => r.date === day.date));
                      setSelectedDate(day.date);
                      setModalOpen(true);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  <div
                    className={`w-full h-full rounded-xl flex items-center justify-center font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all ${color}`}
                  >
                    {day.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-6 text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded-xl" /> Present
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-xl" /> Absent
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-700 rounded-xl" /> No Record
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900/80 border border-neutral-700 backdrop-blur-xl rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Attendance for {selectedDate}</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-3xl leading-none hover:text-red-400 transition"
              >
                &times;
              </button>
            </div>

            {modalRecords.length === 0 ? (
              <p className="text-gray-400">No attendance record found.</p>
            ) : (
              <div className="space-y-3">
                {modalRecords.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-neutral-800/60 border border-neutral-700 rounded-xl"
                  >
                    <div className="font-semibold">Subject: {r.subject || "N/A"}</div>
                    <div className="text-sm text-gray-400">Class: {r.className || "N/A"}</div>
                    <div className="text-sm text-gray-400">Teacher: {r.teacherEmail || "N/A"}</div>
                    <div className="mt-2">
                      Status:{" "}
                      {r.present ? (
                        <span className="text-green-400 font-bold">Present</span>
                      ) : (
                        <span className="text-red-400 font-bold">Absent</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
