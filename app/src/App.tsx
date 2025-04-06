import React, { useEffect, useState, useRef } from "react";
import { Card } from "./components/ui/card.tsx";
import {
  ArrowLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Button } from "./components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog.tsx";
import { cn } from "./lib/utils.ts"; // Utility for combining class names
import { events, staff, clubs } from "./tmp/data.ts";

interface Club {
  id: string;
  name: string;
  leader: string;
  sponsor: string;
  description: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  details: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

const ChatWithBirdie: React.FC = () => {
  const [inputValue, setInputValue] = useState("When is the next engineering Flex Friday?");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleInputSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("User input:", inputValue);

    await fetch("/api/prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: inputValue }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response from server:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    
    // Reset input value and adjust height
    setInputValue("");
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-center w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Chat with Birdie</h1>
        <p className="text-gray-500 mb-8">
          Ask anything about Innovation Academy...
        </p>

        <form 
          onSubmit={handleInputSubmission}
          className="relative flex items-center"
        >
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type your question..."
            className="bg-gray-50 p-4 rounded-lg text-gray-400 resize-none
                 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 w-full transition-all duration-200 shadow-sm pr-12"
            style={{
              minHeight: "3rem",
              maxHeight: "10rem",
            }}
            rows={1}
          />
            <Button 
            type="submit"
            className="absolute right-4 p-2 h-8 w-8 rounded-full hover:bg-gray-500 cursor-pointer"
            >
            <ArrowUp size={18} className="text-white" />
            </Button>
        </form>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<"chat" | "staff" | "clubs" | "clubDetail" | "events">("chat");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
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

  // Function to handle club card click
  const handleClubClick = (club: Club) => {
    setSelectedClub(club);
    setActiveView("clubDetail");
  };

  const upcomingEvents = events.filter((event: Event) =>
    new Date(event.date) >= new Date()
  ).slice(0, 2);

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Left Sidebar */}
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
          {/* Conditional rendering based on activeView */}
          {activeView === "chat" && (
            <ChatWithBirdie />
          )}

          {activeView === "staff" && (
            <div className="w-full max-w-4xl mx-auto">
              {/* Center the content */}
              <button
                onClick={() => setActiveView("chat")}
                className="flex items-center mb-4 text-gray-700 hover:underline"
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </button>
              <h1 className="text-3xl font-bold mb-4 text-center">
                Staff Directory
              </h1>{" "}
              {/* Center heading */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {staff.map((member: Staff) => (
                  <Card
                    key={member.id}
                    className="p-4 transition transform hover:scale-105 shadow-md"
                  >
                    <h2 className="text-xl font-bold">{member.name}</h2>
                    <p className="text-gray-500">{member.role}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === "clubs" && (
            <div className="w-full max-w-4xl mx-auto">
              {/* Center the content */}
              <button
                onClick={() => setActiveView("chat")}
                className="flex items-center mb-4 text-gray-700 hover:underline"
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </button>
              <h1 className="text-3xl font-bold mb-4 text-center">
                Clubs Info
              </h1>{" "}
              {/* Center heading */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {clubs.map((club) => (
                  <Card
                    key={club.id}
                    className="p-4 cursor-pointer transition transform hover:scale-105 shadow-md"
                    onClick={() => handleClubClick(club)}
                  >
                    <h2 className="text-xl font-bold">{club.name}</h2>
                    <p className="text-gray-600">Leader: {club.leader}</p>
                    <p className="text-gray-600">Sponsor: {club.sponsor}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === "clubDetail" && selectedClub && (
            <div className="w-full max-w-2xl mx-auto">
              {/* Center the content */}
              <button
                onClick={() => setActiveView("clubs")}
                className="flex items-center mb-4 text-gray-700 hover:underline"
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </button>
              <Card className="p-6 transition transform hover:scale-105 shadow-md">
                <h1 className="text-3xl font-bold mb-2">{selectedClub.name}</h1>
                <p className="mb-2 text-gray-600">
                  <span className="font-semibold">Leader:</span>{" "}
                  {selectedClub.leader}
                </p>
                <p className="mb-4 text-gray-600">
                  <span className="font-semibold">Sponsor:</span>{" "}
                  {selectedClub.sponsor}
                </p>
                <p className="text-gray-500">{selectedClub.description}</p>
              </Card>
            </div>
          )}

          {activeView === "events" && (
            <div className="w-full max-w-4xl mx-auto">
              {/* Center the content */}
              <button
                onClick={() => setActiveView("chat")}
                className="flex items-center mb-4 text-gray-700 hover:underline"
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </button>
              <h1 className="text-3xl font-bold mb-6 text-center">
                Upcoming Events
              </h1>
              <div className="relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bg-gray-300 w-1 h-full">
                </div>
                {events.map((event, index) => {
                  const isLeft = index % 2 === 0;
                  const cardClasses = cn(
                    "p-4 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 w-full md:w-1/2",
                    isLeft
                      ? "md:mr-auto text-right md:ml-8" // Add left margin for left cards
                      : "md:ml-auto text-left md:mr-8", // Add right margin for right cards
                    "mb-8 relative",
                    "cursor-pointer",
                    "bg-white hover:bg-gray-50 flex flex-col items-start border",
                    isLeft ? "items-end" : "items-start",
                    "border-gray-200 shadow-sm",
                  );

                  return (
                    <React.Fragment key={event.id}>
                      <div className={cardClasses}>
                        <h2 className="text-xl font-bold mb-2">
                          {event.title}
                        </h2>
                        <p className="text-gray-600 text-sm">{event.date}</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="link"
                              className="p-0 mt-2 text-blue-500"
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>{event.title}</DialogTitle>
                              <DialogDescription>
                                Date: {event.date}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p>{event.details}</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
