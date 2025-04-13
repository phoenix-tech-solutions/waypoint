import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Briefcase, Users, Calendar, Settings } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { events } from "../tmp/data.ts";

interface SidebarProps {
  setActiveView: (view: "chat" | "staff" | "clubs" | "events" | "settings") => void;
}

const Sidebar = ({ setActiveView }: SidebarProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const upcomingEvents = events.filter((event) =>
    new Date(event.date) >= new Date()
  ).slice(0, 2);

  return (
    <div
      className={`transition-all duration-300 bg-white dark:bg-gray-900 shadow-lg ${
        isSidebarOpen ? "w-64 md:w-80" : "w-16"
      } p-6 flex flex-col border-r border-gray-200 dark:border-gray-700 relative hidden lg:block`}
    >
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="absolute top-8 right-0 translate-x-1/2 p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full 
                        shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
                        focus:outline-none focus:ring-2 focus:ring-orange-500 z-10 cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {isSidebarOpen && (
        <div className="flex flex-col h-full">
          <div className="flex-grow pt-8">
            <h2 className="text-lg text-gray-500 dark:text-gray-300">Welcome,</h2>
            <h1 className="text-2xl font-bold dark:text-gray-100">John John</h1>
            <Button
              onClick={() => setActiveView("chat")}
              className="mt-4 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow duration-200 text-left cursor-pointer"
            >
              <MessageSquare size={18} /> Chat with Birdie
            </Button>

            <div className="mt-6">
              <h3 className="font-semibold text-lg dark:text-gray-200">Explore</h3>
              <div className="mt-3 space-y-2 flex flex-col">
                <Button
                  variant="ghost"
                  onClick={() => setActiveView("staff")}
                  className="w-full justify-start text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center gap-2 dark:text-gray-300"
                >
                  <Briefcase size={18} /> Staff Directory
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveView("clubs")}
                  className="w-full justify-start text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center gap-2 dark:text-gray-300"
                >
                  <Users size={18} /> Clubs Info
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveView("events")}
                  className="w-full justify-start text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center gap-2 dark:text-gray-300"
                >
                  <Calendar size={18} /> Events
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 dark:text-gray-200">Upcoming Events</h3>
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="mb-2 p-2 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800"
              >
                <span className="text-sm font-medium dark:text-gray-100">{event.title}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{event.date}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            <Button
              variant="ghost"
              onClick={() => setActiveView("settings")}
              className="w-full justify-start text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center gap-2 dark:text-gray-300"
            >
              <Settings size={18} /> Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
