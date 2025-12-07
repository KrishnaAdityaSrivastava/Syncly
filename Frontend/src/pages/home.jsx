import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen flex transition-colors duration-500 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Left Section - Hero */}
      <div className="flex-1 flex flex-col justify-center px-10 md:px-20 space-y-8 relative">
        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`absolute top-6 right-6 p-3 rounded-full shadow-md transition ${
            darkMode
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {darkMode ? (
            <Sun className="text-yellow-400" />
          ) : (
            <Moon className="text-indigo-600" />
          )}
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight"
        >
          Manage work smarter with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            SYNCLY
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`text-lg max-w-lg ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          A powerful, flexible project management tool. Organize projects, track
          tasks, and collaborate seamlessly — reimagined for modern teams.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <button
            onClick={() => navigate("/signin")}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition transform"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className={`px-8 py-3 rounded-xl font-semibold shadow-lg backdrop-blur-sm transition transform hover:scale-105 ${
              darkMode
                ? "bg-gray-800/70 text-gray-100 hover:bg-gray-700/80"
                : "bg-white/70 text-gray-900 hover:bg-gray-200/80"
            }`}
          >
            Sign Up
          </button>
        </motion.div>
      </div>

      {/* Right Section - Illustration / Animated Background */}
      <div
        className={`hidden md:flex flex-1 items-center justify-center relative overflow-hidden ${
          darkMode
            ? "bg-gradient-to-br from-indigo-900 via-gray-900 to-black"
            : "bg-gradient-to-br from-indigo-100 via-white to-purple-100"
        }`}
      >
        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute w-80 h-80 bg-indigo-500 rounded-full opacity-30 blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"
        ></motion.div>

        {/* Card Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`relative z-10 text-center p-10 rounded-2xl shadow-xl backdrop-blur-md ${
            darkMode
              ? "bg-gray-800/70 border border-gray-700"
              : "bg-white/70 border border-gray-300"
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">📊 Visualize your workflow</h2>
          <p
            className={`max-w-sm ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Kanban boards, reports, and team insights — all beautifully designed
            in one place.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
