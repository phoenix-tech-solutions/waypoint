import React, { useEffect, useState } from "react";

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode.toString());
      return newMode;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-8 bg-white dark:bg-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          This is the settings page. Customize your preferences here.
        </p>
        <div className="flex items-center justify-between p-4 border rounded-md shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="text-gray-800 dark:text-gray-200">Dark Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer dark:bg-gray-700 peer-checked:bg-orange-500 transition"></div>
            <span
              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                darkMode ? "translate-x-5" : ""
              }`}
            ></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
