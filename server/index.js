import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------------------ MOCK DATA ------------------

// Admin credential
const admin = { email: "admin@college.in", password: "admin123", role: "admin", name: "System Admin" };

// Teachers
const subjects = ["TOC", "CN", "WTL", "RMIPR", "SEPM", "EVS", "SST", "GENERAL APTITUDE"];
const teachers = subjects.map((subj, i) => ({
  id: i + 1,
  name: `teacher${i + 1}`,
  subject: subj,
  email: `teacher${i + 1}@college.in`,
  password: `teacher${i + 1}123`,
  role: "teacher",
}));

// Students
const classes = ["5A", "5B", "5C", "5D"];
let students = [];
let id = 1;

for (const cls of classes) {
  for (let i = 1; i <= 8; i++) {
    const sName = `student${id}`;
    students.push({
      id,
      name: sName,
      className: cls,
      email: `${sName}@college.in`,
      password: `${sName}123`,
      role: "student",
      attendance: Array.from({ length: 30 }, (_, day) => ({
        date: `2025-10-${(day + 1).toString().padStart(2, "0")}`,
        present: Math.random() > 0.15,
      })),
    });
    id++;
  }
}

// ------------------ ROUTES ------------------

app.get("/", (req, res) => {
  res.send("✅ BlockAttend backend running successfully!");
});

// ---------- LOGIN ----------
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  let user = null;

  if (role === "admin" && email === admin.email && password === admin.password) user = admin;
  else if (role === "teacher")
    user = teachers.find((t) => t.email === email && t.password === password);
  else if (role === "student")
    user = students.find((s) => s.email === email && s.password === password);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ token: "mock-token", user });
});

// ---------- ADMIN ----------
app.get("/api/admin/class-summary", (req, res) => {
  const summary = classes.map((cls) => {
    const clsStudents = students.filter((s) => s.className === cls);
    const avgAttendance =
      clsStudents.reduce((sum, s) => {
        const total = s.attendance.length;
        const present = s.attendance.filter((a) => a.present).length;
        return sum + (present / total) * 100;
      }, 0) / clsStudents.length;

    return {
      className: cls,
      totalStudents: clsStudents.length,
      attendancePercent: avgAttendance.toFixed(1),
    };
  });

  res.json(summary);
});

app.get("/api/admin/class-summary/export", (req, res) => {
  const summary = classes.map((cls) => {
    const clsStudents = students.filter((s) => s.className === cls);
    const avgAttendance =
      clsStudents.reduce((sum, s) => {
        const total = s.attendance.length;
        const present = s.attendance.filter((a) => a.present).length;
        return sum + (present / total) * 100;
      }, 0) / clsStudents.length;

    return {
      className: cls,
      totalStudents: clsStudents.length,
      attendancePercent: avgAttendance.toFixed(1),
    };
  });

  const csv =
    "Class,Total Students,Average Attendance\n" +
    summary.map((c) => `${c.className},${c.totalStudents},${c.attendancePercent}`).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=class_summary.csv");
  res.send(csv);
});

// ---------- TEACHER ----------
app.get("/api/teacher/students", (req, res) => {
  res.json(students);
});

app.get("/api/teacher/export", (req, res) => {
  const csv =
    "Student Name,Class,Attendance %\n" +
    students
      .map((s) => {
        const total = s.attendance.length;
        const present = s.attendance.filter((a) => a.present).length;
        const percent = ((present / total) * 100).toFixed(1);
        return `${s.name},${s.className},${percent}`;
      })
      .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=student_details.csv");
  res.send(csv);
});

// ---------- STUDENT ----------
app.get("/api/student/attendance/:email", (req, res) => {
  const student = students.find((s) => s.email === req.params.email);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student.attendance);
});

// ------------------ SERVER ------------------
const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 BlockAttend Server running on port ${PORT}`));
