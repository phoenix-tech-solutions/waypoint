import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation
} from "react-router-dom";
import { Clock } from "lucide-react";
import ChatWithBirdie from "./components/Chat.tsx";
import Sidebar from "./components/Sidebar.tsx";
import StaffDirectory from "./pages/StaffDirectory.tsx";
import ClubDirectory from "./pages/ClubDirectory.tsx";
import EventTimeline from "./pages/EventTimeline.tsx";
import { AnimatePresence } from "framer-motion";
import SettingsPage from "./pages/SettingsPage.tsx";
import { createClient, type Session } from "@supabase/supabase-js";
import Login from "./pages/Login.tsx";

const supabase = createClient(
  "https://vjbdrsuksueppbxxebzp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYmRyc3Vrc3VlcHBieHhlYnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NjA0NzYsImV4cCI6MjA2MDMzNjQ3Nn0.QNrJgBgwfNS5ttQJruebkyK-hVisApDeXdqtdaMLy9w",
  {auth: { persistSession: true, autoRefreshToken: true }});

const T = () => {
  const [session, setSession] = useState<null | Session>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {location.pathname !== "/login" && <Sidebar />}
      <div className="absolute top-4 right-6 flex items-center space-x-3 text-gray-700 dark:text-gray-300 z-10 hidden md:flex">
        <div>
          <div className="font-bold text-lg text-right">{formattedTime}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formattedDate}
          </div>
        </div>
        <Clock size={40} />
      </div>
    </>
  );
};

const Dashboard: React.FC = () => {
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);


  return (
    <Router>
      <div className="flex h-screen bg-white dark:bg-gray-800 dark:text-gray-100 relative">

        <T />
        <div className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/chat" element={<ChatWithBirdie />} />
              <Route path="/staff" element={<StaffDirectory />} />
              <Route path="/clubs" element={<ClubDirectory />} />
              <Route path="/events" element={<EventTimeline />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/chat" />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
};

export default Dashboard;
