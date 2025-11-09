
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const teachersSubjects = [
  { name: "TOC", emailPrefix: "toc", subject: "TOC" },
  { name: "CN", emailPrefix: "cn", subject: "CN" },
  { name: "WTL", emailPrefix: "wtl", subject: "WTL" },
  { name: "RMIPR", emailPrefix: "rmipr", subject: "RMIPR" },
  { name: "SEPM", emailPrefix: "sepm", subject: "SEPM" },
  { name: "EVS", emailPrefix: "evs", subject: "EVS" },
  { name: "SST", emailPrefix: "sst", subject: "SST" },
  { name: "GA", emailPrefix: "ga", subject: "GENERAL APTITUDE" }
];

const mkId = (n) => Date.now() + n;

// --- Admin ---
const admins = [
  { id: mkId(1), name: "Admin", email: "admin@college.in", password: "admin123" }
];

// --- Teachers ---
const teachers = teachersSubjects.map((t, i) => ({
  id: mkId(100 + i),
  name: `${t.name} Teacher`,
  email: `${t.emailPrefix}@college.in`,
  password: `${t.emailPrefix}123`,
  subjects: [t.subject],
  classes: ["5A", "5B", "5C", "5D"]
}));

const classNames = ["5A", "5B", "5C", "5D"];
const students = [];
let sid = 200;

for (let c = 0; c < classNames.length; c++) {
  const cls = classNames[c];
  const count = c < 2 ? 8 : 7; 
  for (let i = 0; i < count; i++) {
    const name = `student${sid}`;
    students.push({
      id: mkId(300 + sid),
      name,
      email: `${name}@college.in`,
      password: `${name}123`,
      className: cls,
      profilePic: null
    });
    sid++;
  }
}


const users = {
  admins,
  teachers,
  students,
  requests: []
};


fs.writeFileSync(path.join(DATA_DIR, "users.json"), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "attendance.json"), JSON.stringify({ records: [] }, null, 2));

console.log("✅ Seed data written to server/data/users.json and attendance.json");
