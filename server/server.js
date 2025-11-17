// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
require("dotenv").config(); // keeps it optional if dotenv not installed

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

// Data file paths (relative to server folder)
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ATTENDANCE_FILE = path.join(DATA_DIR, "attendance.json");

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Safe read/write helpers
function readAllUsersObj() {
  if (!fs.existsSync(USERS_FILE)) {
    const init = { admins: [], teachers: [], students: [], requests: [] };
    fs.writeFileSync(USERS_FILE, JSON.stringify(init, null, 2), "utf8");
    return init;
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse users.json:", e);
    return { admins: [], teachers: [], students: [], requests: [] };
  }
}
function writeAllUsersObj(obj) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(obj, null, 2), "utf8");
}
function readAttendance() {
  if (!fs.existsSync(ATTENDANCE_FILE)) {
    const init = { records: [] };
    fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(init, null, 2), "utf8");
    return init;
  }
  try {
    return JSON.parse(fs.readFileSync(ATTENDANCE_FILE, "utf8"));
  } catch (e) {
    console.error("Failed to parse attendance.json:", e);
    return { records: [] };
  }
}
function writeAttendance(obj) {
  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(obj, null, 2), "utf8");
}

// Helper: find user by email
function findUserByEmail(email) {
  const all = readAllUsersObj();
  const lists = ["admins", "teachers", "students"];
  for (const key of lists) {
    const u = (all[key] || []).find((x) => String(x.email).toLowerCase() === String(email).toLowerCase());
    if (u) return { user: u, roleList: key };
  }
  return null;
}

// verify credentials (handles bcrypt hashed or plain)
async function verifyCredentials(email, password) {
  const found = findUserByEmail(email);
  if (!found) return null;
  const { user } = found;
  const isHashed = typeof user.password === "string" && user.password.startsWith("$2");
  if (isHashed) {
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return { user, roleList: found.roleList };
  } else {
    if (password === user.password) return { user, roleList: found.roleList };
    return null;
  }
}

// --- On-chain setup (optional)
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.ATTENDANCE_CONTRACT_ADDRESS || null;
const SIGNER_PRIVATE_KEY = (process.env.SIGNER_PRIVATE_KEY || "").trim() || null;
let attendanceContract = null;

if (CONTRACT_ADDRESS && SIGNER_PRIVATE_KEY) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(SIGNER_PRIVATE_KEY, provider);
    // Try to load artifact relative to project root (per your path)
    let artifactPath = path.join(process.cwd(), "blockchain", "artifacts", "contracts", "Attendance.sol", "Attendance.json");
    if (!fs.existsSync(artifactPath)) {
      artifactPath = path.join(process.cwd(), "artifacts", "contracts", "Attendance.sol", "Attendance.json");
    }
    const artifact = require(artifactPath);
    attendanceContract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer);
    console.log(`✅ On-chain Attendance enabled. Contract: ${CONTRACT_ADDRESS}`);
  } catch (e) {
    console.error("Failed to initialize on-chain attendance contract:", e && e.message ? e.message : e);
    attendanceContract = null;
  }
} else {
  if (CONTRACT_ADDRESS && !SIGNER_PRIVATE_KEY) console.warn("ATTENDANCE_CONTRACT_ADDRESS set but SIGNER_PRIVATE_KEY missing — on-chain disabled");
}

// --- Endpoints ---

app.get("/", (req, res) => res.send("✅ BlockAttend server running"));

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, className } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: "All fields required" });

    const all = readAllUsersObj();
    if (findUserByEmail(email)) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), name, email, password: hashed };

    if (role === "admin") {
      all.admins.push(newUser);
    } else if (role === "teacher") {
      newUser.subjects = newUser.subjects || [];
      newUser.classes = newUser.classes || [];
      all.teachers.push(newUser);
    } else {
      newUser.className = className || null;
      newUser.profilePic = null;
      all.students.push(newUser);
    }

    writeAllUsersObj(all);
    return res.json({ message: "Registration successful", user: { id: newUser.id, name: newUser.name, email: newUser.email, role } });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/teachers-count", (req, res) => {
  try {
    const allUsers = readAllUsersObj();
    const teachers = allUsers.teachers || [];
    res.json({ count: teachers.length });
  } catch (err) {
    console.error("Teachers count error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/students-count", (req, res) => {
  try {
    const allUsers = readAllUsersObj();
    const students = allUsers.students || [];
    res.json({ count: students.length });
  } catch (err) {
    console.error("Students count error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const ok = await verifyCredentials(email, password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const user = ok.user;
    const detectedRole = role || (readAllUsersObj().admins.find(a => a.email === user.email) ? "admin" :
                                 readAllUsersObj().teachers.find(t => t.email === user.email) ? "teacher" : "student");

    const token = jwt.sign({ id: user.id, email: user.email, role: detectedRole }, JWT_SECRET, { expiresIn: "4h" });
    return res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: detectedRole } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Approve user (admin action) — adds to students or teachers list and hashes password
app.post("/api/admin/approve", async (req, res) => {
  try {
    const { id, name, email, role, className, password } = req.body;
    if (!name || !email || !role) return res.status(400).json({ error: "Missing required fields" });

    const all = readAllUsersObj();
    if (findUserByEmail(email)) return res.status(400).json({ error: "Email already exists in system" });

    const plain = password || "changeMe123";
    const hashed = await bcrypt.hash(plain, 10);
    const newUser = { id: id || Date.now(), name, email, password: hashed };

    if (role === "student") {
      newUser.className = className || null;
      all.students.push(newUser);
    } else if (role === "teacher") {
      newUser.subjects = [];
      newUser.classes = [];
      all.teachers.push(newUser);
    } else if (role === "admin") {
      all.admins.push(newUser);
    } else {
      return res.status(400).json({ error: "Unknown role" });
    }

    writeAllUsersObj(all);
    return res.json({ message: "User approved & added to backend", user: { id: newUser.id, email: newUser.email, name: newUser.name, role } });
  } catch (err) {
    console.error("Approve user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Teacher: get students (approved only)
app.get("/api/teacher/students", (req, res) => {
  try {
    const allUsers = readAllUsersObj();
    res.json(allUsers.students || []);
  } catch (err) {
    console.error("teacher/students error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Teacher: mark attendance (single record)
app.post("/api/teacher/mark", async (req, res) => {
  try {
    const { teacherEmail, subject, className, studentEmail, date, present } = req.body;
    if (!studentEmail || typeof present === "undefined") return res.status(400).json({ error: "studentEmail and present required" });

    const attendance = readAttendance();
    attendance.records.push({
      teacherEmail: teacherEmail || null,
      subject: subject || null,
      className: className || null,
      studentEmail,
      date: date || (new Date().toISOString().slice(0,10)),
      present: !!present
    });
    writeAttendance(attendance);

    // Non-blocking on-chain attempt (doesn't affect API success)
    if (attendanceContract) {
      (async () => {
        try {
          const dateUnix = Math.floor(new Date(date || new Date().toISOString().slice(0,10)).getTime() / 1000);
          // student address unknown in current system, using zero address placeholder
          const studentAddr = ethers.ZeroAddress;
          const tx = await attendanceContract.markAttendance(subject || "", className || "", studentAddr, dateUnix, !!present);
          await tx.wait();
          console.log(`On-chain attendance tx confirmed: ${tx.hash}`);
        } catch (e) {
          console.error("On-chain markAttendance failed:", e && e.message ? e.message : e);
        }
      })();
    }

    return res.json({ message: "Attendance recorded" });
  } catch (err) {
    console.error("mark attendance error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Student: attendance history
app.get("/api/student/attendance/:email", (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const attendance = readAttendance();
    const recs = (attendance.records || []).filter(r => r.studentEmail === email);
    if (!recs.length) {
      // generate 30-day mock entries if none present
      const days = Array.from({length:30}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const d = date.toISOString().slice(0,10);
        return { date: d, present: Math.random() > 0.15 };
      });
      return res.json(days);
    }
    res.json(recs.map(r => ({ subject: r.subject, className: r.className, teacherEmail: r.teacherEmail, date: r.date, present: !!r.present })));
  } catch (err) {
    console.error("student/attendance error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: low attendance
app.get("/api/admin/low-attendance-students", (req, res) => {
  try {
    const all = readAllUsersObj();
    const attendance = readAttendance();
    const students = all.students || [];
    const records = attendance.records || [];

    const studentRecords = {};
    records.forEach(rec => {
      if (!studentRecords[rec.studentEmail]) studentRecords[rec.studentEmail] = [];
      studentRecords[rec.studentEmail].push(rec);
    });

    const lowAttendanceByClass = {};
    students.forEach(student => {
      const recs = studentRecords[student.email] || [];
      const presentDays = recs.filter(r => r.present === true).length;
      const totalDays = recs.length;
      const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 100;
      if (percentage < 75 && totalDays > 0) {
        const className = student.className || "Unknown";
        if (!lowAttendanceByClass[className]) lowAttendanceByClass[className] = [];
        lowAttendanceByClass[className].push({
          name: student.name,
          email: student.email,
          password: student.password,
          attendancePercentage: parseFloat(percentage),
          presentDays,
          totalDays,
          className
        });
      }
    });

    res.json(lowAttendanceByClass);
  } catch (err) {
    console.error("Low attendance query error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Debug endpoint: all users flat
app.get("/api/all-users-flat", (req, res) => {
  const all = readAllUsersObj();
  const flat = []
    .concat((all.admins||[]).map(u=>({...u, role:'admin'})))
    .concat((all.teachers||[]).map(u=>({...u, role:'teacher'})))
    .concat((all.students||[]).map(u=>({...u, role:'student'})));
  res.json(flat);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
