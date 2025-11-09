import React, { useState, useEffect } from "react";
import axios from "axios";
import { attendanceAddress, attendanceABI } from "./config";
import { ethers } from "ethers";

axios.defaults.baseURL = "http://localhost:4000";

// ---------- Header ----------
function Header({ user, onLogout }) {
  return (
    <header
      style={{
        background: "#0a192f",
        padding: "15px 30px",
        color: "#fff",
        fontWeight: 700,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        borderBottom: "2px solid #64ffda",
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: 2 }}>BLOCKATTEND</div>
      {user && (
        <div>
          <span style={{ marginRight: 12 }}>
            {user.name} ({user.role})
          </span>
          <button
            onClick={onLogout}
            style={{
              background: "#1f4068",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

// ---------- Home ----------
function Home({ onRole }) {
  return (
    <div style={{ textAlign: "center", marginTop: 60, color: "#fff" }}>
      <h1
        style={{
          fontSize: "3rem",
          letterSpacing: 2,
          color: "#64ffda",
          fontWeight: "bold",
        }}
      >
        BLOCKATTEND
      </h1>
      <p style={{ color: "#a8b2d1", marginTop: -5 }}>
        Smart Blockchain-Based Attendance System
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginTop: 60,
          flexWrap: "wrap",
        }}
      >
        {[
          { role: "admin", title: "Admin Login", desc: "Classwise Summary" },
          { role: "teacher", title: "Teacher Login", desc: "Manage Students" },
          { role: "student", title: "Student Login", desc: "View Attendance" },
        ].map((item) => (
          <div
            key={item.role}
            onClick={() => onRole(item.role)}
            style={{
              background: "#112240",
              borderRadius: 16,
              width: 240,
              height: 160,
              padding: 25,
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1.0)")
            }
          >
            <h3 style={{ color: "#64ffda" }}>{item.title}</h3>
            <p style={{ color: "#ccd6f6", fontSize: 14 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 50 }}>
        <button
          onClick={() => onRole("register")}
          style={{
            background: "#64ffda",
            color: "#0a192f",
            border: "none",
            padding: "10px 25px",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
          }}
        >
          ➕ Register
        </button>
      </div>

      <footer
        style={{
          marginTop: 80,
          color: "#8892b0",
          fontSize: 13,
          borderTop: "1px solid #1f4068",
          paddingTop: 20,
        }}
      >
        © 2025 BlockAttend. All Rights Reserved.
      </footer>
    </div>
  );
}

// ---------- Blockchain Helper ----------
async function getContract() {
  try {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(attendanceAddress, attendanceABI, signer);
    return contract;
  } catch (err) {
    console.error("❌ Blockchain not connected:", err);
    return null;
  }
}

// ---------- Admin Panel ----------
function AdminPanel() {
  const [classSummary, setClassSummary] = useState([]);

  useEffect(() => {
    axios
      .get("/api/admin/class-summary")
      .then((r) => setClassSummary(r.data))
      .catch(() => setClassSummary([]));
  }, []);

  async function exportClassSummary() {
    const res = await axios.get("/api/admin/class-summary/export", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "class_summary.csv";
    document.body.appendChild(a);
    a.click();
  }

  return (
    <div
      style={{
        margin: 20,
        padding: 20,
        background: "#112240",
        borderRadius: 10,
        color: "#fff",
      }}
    >
      <h3 style={{ color: "#64ffda" }}>Admin Dashboard</h3>
      <div
        style={{
          overflowX: "auto",
          background: "#07101a",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #1f4068",
          marginTop: 15,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#1f4068" }}>
            <tr>
              <th style={{ padding: 10, textAlign: "left" }}>Class</th>
              <th>Total Students</th>
              <th>Average Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {classSummary.map((c) => (
              <tr key={c.className}>
                <td style={{ padding: 8 }}>{c.className}</td>
                <td>{c.totalStudents}</td>
                <td>{c.attendancePercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={exportClassSummary}
        style={{
          marginTop: 12,
          background: "#64ffda",
          color: "#0a192f",
          padding: "8px 14px",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Export CSV
      </button>
    </div>
  );
}

// ---------- Teacher Panel ----------
function TeacherPanel() {
  const [status, setStatus] = useState("Idle");

  async function markAttendance() {
    const contract = await getContract();
    if (!contract) return alert("⚠️ Blockchain not connected");
    setStatus("Recording...");
    try {
      const tx = await contract.recordAttendance("John Doe", true);
      await tx.wait();
      setStatus("✅ Attendance Recorded on Blockchain!");
    } catch (err) {
      setStatus("❌ Failed to record");
    }
  }

  return (
    <div
      style={{
        margin: 20,
        padding: 20,
        background: "#112240",
        borderRadius: 10,
        color: "#fff",
      }}
    >
      <h3 style={{ color: "#64ffda" }}>Teacher Dashboard</h3>
      <button
        onClick={markAttendance}
        style={{
          background: "#64ffda",
          color: "#0a192f",
          padding: "8px 14px",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600,
          marginTop: 10,
        }}
      >
        Record Attendance
      </button>
      <p style={{ marginTop: 15 }}>{status}</p>
    </div>
  );
}

// ---------- Student Panel ----------
function StudentPanel() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios.get("/api/student/attendance").then((r) => setRecords(r.data));
  }, []);

  const total = records.length;
  const present = records.filter((a) => a.present).length;
  const percent = total ? ((present / total) * 100).toFixed(2) : 0;

  return (
    <div
      style={{
        margin: 20,
        padding: 20,
        background: "#112240",
        borderRadius: 10,
        color: "#fff",
      }}
    >
      <h3 style={{ color: "#64ffda" }}>Student Dashboard</h3>
      <p>Total Classes: {total}</p>
      <p>Present Days: {present}</p>
      <p>Attendance: {percent}%</p>
      <p style={{ color: percent >= 85 ? "#64ffda" : "salmon" }}>
        {percent >= 85 ? "✅ Eligible for Exams" : "❌ Not Eligible"}
      </p>
    </div>
  );
}

// ---------- Login ----------
function Login({ role, onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e) {
    e.preventDefault();
    onLogin({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      email,
      role,
    });
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "60px auto",
        padding: 20,
        background: "#112240",
        borderRadius: 8,
        color: "#fff",
      }}
    >
      <h3 style={{ color: "#64ffda" }}>{role.toUpperCase()} Login</h3>
      <form onSubmit={submit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginTop: 10, padding: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginTop: 10, padding: 8 }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="submit">Login</button>
          <button type="button" onClick={onBack}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------- Main App ----------
function App() {
  const [view, setView] = useState("home");
  const [auth, setAuth] = useState(null);

  function handleLogout() {
    setAuth(null);
    setView("home");
  }

  if (auth) {
    if (auth.role === "admin")
      return (
        <>
          <Header user={auth} onLogout={handleLogout} />
          <AdminPanel />
        </>
      );
    if (auth.role === "teacher")
      return (
        <>
          <Header user={auth} onLogout={handleLogout} />
          <TeacherPanel />
        </>
      );
    if (auth.role === "student")
      return (
        <>
          <Header user={auth} onLogout={handleLogout} />
          <StudentPanel />
        </>
      );
  }

  return (
    <div style={{ background: "#0a192f", minHeight: "100vh" }}>
      <Header user={null} />
      <main>
        {view === "home" && <Home onRole={(r) => setView(r)} />}
        {["admin", "teacher", "student"].includes(view) && (
          <Login
            role={view}
            onLogin={(u) => setAuth(u)}
            onBack={() => setView("home")}
          />
        )}
      </main>
    </div>
  );
}

export default App;
