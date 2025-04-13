// only dark mode setting working

import React, { useEffect, useState } from "react";
import { Moon, Bell, Minimize2, Activity, Settings } from "lucide-react";

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem("reduceMotion") === "true");
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem("compactMode") === "true");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("notifications") !== "false");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("reduceMotion", reduceMotion.toString());
    document.body.style.setProperty("transition", reduceMotion ? "none" : "");
  }, [reduceMotion]);

  useEffect(() => {
    localStorage.setItem("compactMode", compactMode.toString());
    document.documentElement.style.setProperty("--layout-gap", compactMode ? "0.5rem" : "1rem");
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem("notifications", notifications.toString());
  }, [notifications]);

  const SettingToggle = ({
    label,
    icon,
    value,
    onChange,
  }: {
    label: string;
    icon: React.ReactNode;
    value: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 transition-all">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-gray-800 dark:text-gray-100 font-medium">{label}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={value} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full dark:bg-gray-700 peer-checked:bg-orange-500 transition-all duration-300" />
        <span
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? "translate-x-5" : ""
          }`}
        />
      </label>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out both;
        }
      `}</style>

      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-900 dark:text-white flex items-center justify-center gap-2">
        <Settings size={28} /> Settings
      </h1>

      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-xl mx-auto">
          Personalize your experience. These preferences are stored locally and persist across sessions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <SettingToggle
            label="Dark Mode"
            icon={<Moon size={20} className="text-orange-500" />}
            value={darkMode}
            onChange={() => setDarkMode((v) => !v)}
          />
          <SettingToggle
            label="Reduce Motion"
            icon={<Activity size={20} className="text-orange-500" />}
            value={reduceMotion}
            onChange={() => setReduceMotion((v) => !v)}
          />
          <SettingToggle
            label="Compact Layout"
            icon={<Minimize2 size={20} className="text-orange-500" />}
            value={compactMode}
            onChange={() => setCompactMode((v) => !v)}
          />
          <SettingToggle
            label="Notifications"
            icon={<Bell size={20} className="text-orange-500" />}
            value={notifications}
            onChange={() => setNotifications((v) => !v)}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
