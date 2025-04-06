import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import ChatWithBirdie from "./components/chat.tsx";
import Sidebar from "./components/sidebar.tsx";
import StaffDirectory from "./pages/StaffDirectory.tsx";
import ClubDirectory from "./pages/ClubDirectory.tsx";
import EventTimeline from "./pages/EventTimeline.tsx";

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<"chat" | "staff" | "clubs" | "clubDetail" | "events">("chat");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time and date
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Top-right time display */}
        <div className="absolute top-4 right-6 flex items-center space-x-3 text-gray-700">
          <div>
            <div className="font-bold text-lg text-right">{formattedTime}</div>
            <div className="text-sm text-gray-500">{formattedDate}</div>
          </div>
          <Clock size={40} />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Conditional rendering based on `activeView` */}

          {activeView === "chat" && (
            <ChatWithBirdie />
          )}

          {activeView === "staff" && (
            <StaffDirectory setActiveView={setActiveView} />
          )}

          {activeView === "clubs" && (
            <ClubDirectory setActiveView={setActiveView} />
          )}

          {activeView === "events" && (
            <EventTimeline setActiveView={setActiveView} />
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
