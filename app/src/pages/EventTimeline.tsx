import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog.tsx";
import { cn } from "../lib/utils.ts";
import { events } from "../tmp/data.ts";

interface Event {
    id: number;
    title: string;
    date: string;
    details: string;
}

const EventTimeline = ({ setActiveView }) => {
    return (
        <div className="w-full max-w-4xl mx-auto">
              {/* Center the content */}
              <button
                onClick={() => setActiveView("chat")}
                className="flex items-center mb-4 text-gray-700 hover:underline cursor-pointer"
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
                {events.map((event: Event, index) => {
                  const isLeft = index % 2 === 0;
                  const cardClasses = cn(
                    "p-4 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 w-full md:w-1/2",
                    isLeft
                      ? "md:mr-auto text-right md:ml-8" // Add left margin for left cards
                      : "md:ml-auto text-left md:mr-8", // Add right margin for right cards
                    "mb-8 relative",
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
                              className="p-0 mt-2 text-orange-500 cursor-pointer"
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
    );
};
          
export default EventTimeline;