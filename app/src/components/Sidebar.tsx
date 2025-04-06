import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { events } from "../tmp/data.ts";



const Sidebar = ({ setActiveView }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const upcomingEvents = events.filter((event) =>
        new Date(event.date) >= new Date()
    ).slice(0, 2);

    return (
        <div className={`transition-all duration-300 bg-white shadow-lg ${
            isSidebarOpen ? "w-64 md:w-80" : "w-16"
        } p-6 flex flex-col border-r border-gray-200 relative`}>
            {/* Sidebar Toggle Button */}
            <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="absolute top-8 right-0 translate-x-1/2 p-2 bg-white text-gray-600 rounded-full 
                        shadow-md hover:shadow-lg border border-gray-200 hover:bg-gray-50
                        focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label="Toggle Sidebar"
            >
            {isSidebarOpen ? (
                <ChevronLeft size={20} />
            ) : (
                <ChevronRight size={20} />
            )}
            </button>

            {isSidebarOpen && (
            <div className="flex flex-col h-full">
                {/* Main Content */}
                <div className="flex-grow pt-8">
                <h2 className="text-lg text-gray-500">Welcome,</h2>
                <h1 className="text-2xl font-bold">John John</h1>
                <Button
                    onClick={() => setActiveView("chat")}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow duration-200 text-left"
                >
                    <MessageSquare size={18} /> Chat with Birdie
                </Button>

                {/* Additional Navigation */}
                <div className="mt-6">
                    <h3 className="font-semibold text-lg">Explore</h3>
                    <div className="mt-3 space-y-2 flex flex-col">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveView("staff")}
                        className="w-full justify-start text-left hover:bg-gray-200 rounded"
                    >
                        Staff Directory
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveView("clubs")}
                        className="w-full justify-start text-left hover:bg-gray-200 rounded"
                    >
                        Clubs Info
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveView("events")}
                        className="w-full justify-start text-left hover:bg-gray-200 rounded"
                    >
                        Events
                    </Button>
                    </div>
                </div>
                </div>

                {/* Upcoming Events Section */}
                <div>
                <h3 className="font-semibold text-lg mb-3">Upcoming Events</h3>
                {upcomingEvents.map((event) => (
                    <div
                    key={event.id}
                    className="mb-2 p-2 rounded-md border border-gray-200 shadow-sm"
                    >
                    <span className="text-sm font-medium">{event.title}</span>
                    <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
    );
};

export default Sidebar;