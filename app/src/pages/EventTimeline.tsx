import React from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "../components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog.tsx";
import { cn } from "../lib/utils.ts";
import { events } from "../tmp/data.ts";

interface Event {
  id: number;
  title: string;
  date: string;
  details: string;
}

interface EventTimelineProps {
  setActiveView: (view: "chat" | "staff" | "clubs" | "events" | "settings") => void;
}

const EventTimeline = ({ setActiveView }: EventTimelineProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-8 bg-white dark:bg-gray-800 dark:text-gray-100 relative">
      <style>{`
        @keyframes growLine {
          0% { height: 0%; }
          100% { height: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-grow-line {
          animation: growLine 1.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>

      <button
        onClick={() => setActiveView("chat")}
        className="flex items-center mb-4 text-gray-700 hover:underline cursor-pointer dark:text-gray-300"
      >
        <ArrowLeft size={16} className="mr-1" /> Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Calendar size={24} /> Upcoming Events
      </h1>

      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 bg-gray-300 dark:bg-gray-700 w-1 animate-grow-line origin-top" />

        {events.map((event: Event, index) => {
          const isLeft = index % 2 === 0;
          const cardClasses = cn(
            "p-4 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 w-full md:w-1/2",
            isLeft
              ? "md:mr-auto text-right md:ml-8 items-end"
              : "md:ml-auto text-left md:mr-8 items-start",
            "mb-8 relative flex flex-col border",
            "bg-white hover:bg-gray-50 border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200",
            "opacity-0 animate-fade-in"
          );

          return (
            <React.Fragment key={event.id}>
              <div
                className={cardClasses}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                <p className="text-gray-600 text-sm dark:text-gray-400">{event.date}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="p-0 mt-2 text-orange-500 cursor-pointer"
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:text-gray-100">
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
