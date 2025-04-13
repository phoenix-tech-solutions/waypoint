import React, { useEffect, useState } from "react";
import {
  Moon,
  Bell,
  Minimize2,
  Activity,
  Settings,
  Bot,
  Type,
  Sparkles,
  Mic,
  Volume2,
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem("reduceMotion") === "true");
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem("compactMode") === "true");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("notifications") !== "false");

  const [typingEffect, setTypingEffect] = useState(() => localStorage.getItem("typingEffect") !== "false");
  const [voiceInput, setVoiceInput] = useState(() => localStorage.getItem("voiceInput") === "true");
  const [voiceOutput, setVoiceOutput] = useState(() => localStorage.getItem("voiceOutput") === "true");
  const [showSuggestions, setShowSuggestions] = useState(() => localStorage.getItem("showSuggestions") !== "false");

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

  useEffect(() => localStorage.setItem("notifications", notifications.toString()), [notifications]);
  useEffect(() => localStorage.setItem("typingEffect", typingEffect.toString()), [typingEffect]);
  useEffect(() => localStorage.setItem("voiceInput", voiceInput.toString()), [voiceInput]);
  useEffect(() => localStorage.setItem("voiceOutput", voiceOutput.toString()), [voiceOutput]);
  useEffect(() => localStorage.setItem("showSuggestions", showSuggestions.toString()), [showSuggestions]);

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

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Interface Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              label="Enable Notifications"
              icon={<Bell size={20} className="text-orange-500" />}
              value={notifications}
              onChange={() => setNotifications((v) => !v)}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Chatbot Behavior</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SettingToggle
              label="Typing Effect"
              icon={<Type size={20} className="text-orange-500" />}
              value={typingEffect}
              onChange={() => setTypingEffect((v) => !v)}
            />
            <SettingToggle
              label="Voice Input"
              icon={<Mic size={20} className="text-orange-500" />}
              value={voiceInput}
              onChange={() => setVoiceInput((v) => !v)}
            />
            <SettingToggle
              label="Voice Output"
              icon={<Volume2 size={20} className="text-orange-500" />}
              value={voiceOutput}
              onChange={() => setVoiceOutput((v) => !v)}
            />
            <SettingToggle
              label="Smart Suggestions"
              icon={<Sparkles size={20} className="text-orange-500" />}
              value={showSuggestions}
              onChange={() => setShowSuggestions((v) => !v)}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
