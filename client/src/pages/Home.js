import { Link } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerType, setRegisterType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    subjects: "",
    classes: "",
    className: "",
  });

  function handleRegisterSubmit(e) {
    e.preventDefault();
    const newRequest = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: registerType,
      ...(registerType === "teacher" && {
        subjects: formData.subjects.split(",").map((s) => s.trim()),
        classes: formData.classes.split(",").map((c) => c.trim()),
      }),
      ...(registerType === "student" && { className: formData.className }),
      status: "pending",
      requestDate: new Date().toLocaleDateString(),
    };

    const requests = JSON.parse(localStorage.getItem("pendingRequests") || "[]");
    requests.push(newRequest);
    localStorage.setItem("pendingRequests", JSON.stringify(requests));

    setShowRegisterModal(false);
    setRegisterType(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      subjects: "",
      classes: "",
      className: "",
    });
    alert("✓ Registration request submitted! Admin will review it soon.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">
      <div className="text-center py-20 px-4">
        <div className="mb-16">
          <h1 className="text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,200,255,0.4)]">
            BlockAttend
          </h1>
        </div>

        <p className="text-gray-500 mb-12 text-lg">Select your role to continue</p>

        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <Link
            to="/admin-login"
            className="group p-10 rounded-2xl bg-neutral-900/40 backdrop-blur-md border border-neutral-700 hover:border-blue-500 transition-all duration-300 hover:scale-[1.03] shadow-xl hover:shadow-blue-500/30"
          >
            <h2 className="text-3xl font-bold mb-2 group-hover:text-blue-400 transition">
              Admin
            </h2>
          </Link>

          <Link
            to="/teacher-login"
            className="group p-10 rounded-2xl bg-neutral-900/40 backdrop-blur-md border border-neutral-700 hover:border-green-500 transition-all duration-300 hover:scale-[1.03] shadow-xl hover:shadow-green-500/30"
          >
            <h2 className="text-3xl font-bold mb-2 group-hover:text-green-400 transition">
              Teacher
            </h2>
          </Link>

          <Link
            to="/student-login"
            className="group p-10 rounded-2xl bg-neutral-900/40 backdrop-blur-md border border-neutral-700 hover:border-purple-500 transition-all duration-300 hover:scale-[1.03] shadow-xl hover:shadow-purple-500/30"
          >
            <h2 className="text-3xl font-bold mb-2 group-hover:text-purple-400 transition">
              Student
            </h2>
          </Link>
        </div>

        {/* REGISTER BUTTONS */}
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">New User?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button
              onClick={() => {
                setRegisterType("teacher");
                setShowRegisterModal(true);
              }}
              className="px-6 py-3 rounded-lg bg-neutral-900/60 border border-green-500/40 hover:bg-neutral-800 hover:border-green-400 transition-all text-white font-semibold shadow-lg hover:shadow-green-500/20"
            >
              Register as Teacher
            </button>

            <button
              onClick={() => {
                setRegisterType("student");
                setShowRegisterModal(true);
              }}
              className="px-6 py-3 rounded-lg bg-neutral-900/60 border border-purple-500/40 hover:bg-neutral-800 hover:border-purple-400 transition-all text-white font-semibold shadow-lg hover:shadow-purple-500/20"
            >
              Register as Student
            </button>
          </div>
        </div>
      </div>

      {/* REGISTER MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="w-full max-w-lg bg-neutral-900/90 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
            <div
              className={`px-8 py-5 text-white font-bold text-xl bg-gradient-to-r ${
                registerType === "teacher"
                  ? "from-green-600 to-green-700"
                  : "from-purple-600 to-purple-700"
              }`}
            >
              Register as {registerType === "teacher" ? "Teacher" : "Student"}
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-8 space-y-5">
              {/* Inputs */}
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-cyan-400 transition"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-cyan-400 transition"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-cyan-400 transition"
                required
              />

              {/* Conditional inputs */}
              {registerType === "teacher" ? (
                <>
                  <input
                    type="text"
                    placeholder="Subjects (comma separated)"
                    value={formData.subjects}
                    onChange={(e) =>
                      setFormData({ ...formData, subjects: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-cyan-400 transition"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Classes (comma separated)"
                    value={formData.classes}
                    onChange={(e) =>
                      setFormData({ ...formData, classes: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-cyan-400 transition"
                    required
                  />
                </>
              ) : (
                <input
                  type="text"
                  placeholder="Class Name (e.g., 5A)"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-cyan-400 transition"
                  required
                />
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className={`flex-1 py-3 rounded-lg text-white font-semibold transition shadow-lg ${
                    registerType === "teacher"
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:brightness-110"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 hover:brightness-110"
                  }`}
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-3 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 rounded-lg transition text-white font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
