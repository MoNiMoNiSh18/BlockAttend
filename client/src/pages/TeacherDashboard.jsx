// client/src/pages/TeacherDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const res = await fetch("/api/teacher/students");
      const data = await res.json();
      setStudents(data || []);

      const cls = Array.from(new Set((data || []).map((s) => s.className).filter(Boolean)));
      setClasses(cls);
      if (cls.length) setSelectedClass(cls[0]);

      const map = {};
      (data || []).forEach((s) => {
        map[s.email] = true;
      });
      setAttendanceMap(map);
    } catch (e) {
      console.error("Failed to load students", e);
    }
  }

  function handleToggle(email) {
    setAttendanceMap((prev) => ({ ...prev, [email]: !prev[email] }));
  }

  function markAll(value) {
    const visible = students.filter((s) => !selectedClass || s.className === selectedClass);
    const map = { ...attendanceMap };
    visible.forEach((s) => (map[s.email] = value));
    setAttendanceMap(map);
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    const visible = students.filter((s) => !selectedClass || s.className === selectedClass);

    try {
      for (const s of visible) {
        const payload = {
          teacherEmail: user?.email || "",
          subject,
          className: s.className || selectedClass || "",
          studentEmail: s.email,
          date,
          present: !!attendanceMap[s.email],
        };

        const res = await fetch("/api/teacher/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Mark failed");
        }
      }

      setMessage("Attendance submitted successfully.");
      await fetchStudents();
    } catch (e) {
      console.error("Submit failed", e);
      setMessage("Failed to submit attendance: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Attendance Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Teacher: ${user?.name}`, 14, 30);
    doc.text(`Class: ${selectedClass || "All Classes"}`, 14, 38);
    doc.text(`Subject: ${subject}`, 14, 46);
    doc.text(`Date: ${date}`, 14, 54);

    const visible = students.filter((s) => !selectedClass || s.className === selectedClass);

    const tableData = visible.map((s) => [
      s.name,
      s.email,
      s.className,
      attendanceMap[s.email] ? "Present" : "Absent",
    ]);

    doc.autoTable({
      startY: 65,
      head: [["Name", "Email", "Class", "Status"]],
      body: tableData,
    });

    doc.save(`Attendance_${selectedClass}_${date}.pdf`);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const visibleStudents = students.filter(
    (s) => !selectedClass || s.className === selectedClass
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white">

      {/* NAVBAR */}
      <nav className="backdrop-blur-xl bg-neutral-900/60 border-b border-neutral-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-gray-400">{user?.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-lg bg-red-700 hover:bg-red-600 transition-all shadow-md font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Students Taught", value: students.length },
            { label: "Classes Assigned", value: classes.length },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 shadow-xl rounded-xl p-6 hover:scale-105 transition-transform"
            >
              <p className="text-gray-400 text-sm">{item.label}</p>
              <p className="text-3xl font-bold mt-2">{item.value}</p>
            </div>
          ))}

          {/* PDF CARD */}
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 shadow-xl rounded-xl p-6 hover:scale-105 transition-transform">
            <p className="text-gray-400 text-sm">PDF Export</p>
            <button
              onClick={exportPDF}
              className="mt-2 w-full px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all font-semibold shadow-lg"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* ATTENDANCE SECTION */}
        <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 rounded-xl p-8 shadow-2xl">

          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Mark Attendance
          </h2>

          {/* INPUTS */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-300">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full mt-2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 ring-blue-500 outline-none"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 ring-blue-500 outline-none"
                placeholder="Subject"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* BULK BUTTONS */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => markAll(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg shadow-md transition-all"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg shadow-md transition-all"
            >
              Mark All Absent
            </button>
          </div>

          {/* STUDENTS LIST */}
          <div className="max-h-96 overflow-y-auto rounded-lg bg-neutral-900/30 border border-neutral-800 p-4 shadow-inner">

            {visibleStudents.length === 0 ? (
              <p className="text-gray-400">No students for selected class.</p>
            ) : (
              <div className="space-y-3">
                {visibleStudents.map((s) => (
                  <div
                    key={s.email}
                    className="flex justify-between items-center p-3 bg-neutral-800/60 border border-neutral-700 rounded-lg hover:border-blue-500 transition"
                  >
                    <div>
                      <p className="font-bold">{s.name}</p>
                      <p className="text-sm text-gray-400">{s.email} • {s.className}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-300">Present</label>
                      <input
                        type="checkbox"
                        checked={!!attendanceMap[s.email]}
                        onChange={() => handleToggle(s.email)}
                        className="w-5 h-5 accent-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 transition-all shadow-xl font-semibold"
            >
              {loading ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>

          {message && <p className="mt-4 text-gray-300">{message}</p>}
        </div>
      </div>
    </div>
  );
}
