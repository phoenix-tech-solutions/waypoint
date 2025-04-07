import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import ChatWithBirdie from "./components/Chat.tsx";
import Sidebar from "./components/Sidebar.tsx";
import StaffDirectory from "./pages/StaffDirectory.tsx";
import ClubDirectory from "./pages/ClubDirectory.tsx";
import EventTimeline from "./pages/EventTimeline.tsx";
import { AnimatePresence, motion } from "framer-motion";

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<
    "chat" | "staff" | "clubs" | "events"
  >("chat");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col bg-white relative">
        <div className="absolute top-4 right-6 flex items-center space-x-3 text-gray-700 z-10 hidden md:flex">
          <div>
            <div className="font-bold text-lg text-right">{formattedTime}</div>
            <div className="text-sm text-gray-500">{formattedDate}</div>
          </div>
          <Clock size={40} />
        </div>

        <div className="flex-1 overflow-auto p-6 relative">
          <AnimatePresence mode="wait">
            {activeView === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 mb-4 mt-5"
              >
                <ChatWithBirdie />
              </motion.div>
            )}

            {activeView === "staff" && (
              <motion.div
                key="staff"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pt-5"
              >
                <StaffDirectory setActiveView={setActiveView} />
              </motion.div>
            )}

            {activeView === "clubs" && (
              <motion.div
                key="clubs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pt-5"
              >
                <ClubDirectory setActiveView={setActiveView} />
              </motion.div>
            )}

            {activeView === "events" && (
              <motion.div
                key="events"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pt-5"
              >
                <EventTimeline setActiveView={setActiveView} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
