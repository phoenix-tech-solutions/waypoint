import React from "react";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Card } from "../components/ui/card.tsx";
import { staff } from "../tmp/data.ts";

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface StaffDirectoryProps {
  setActiveView: (view: "chat" | "staff" | "clubs" | "events" | "settings") => void;
}

const StaffDirectory = ({ setActiveView }: StaffDirectoryProps) => {
    return (<div className="w-full max-w-4xl mx-auto">
        <button
          onClick={() => setActiveView("chat")}
          className="flex items-center mb-4 text-gray-700 hover:underline cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        <h1 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
          <Briefcase size={24} /> Staff Directory
        </h1>{" "}
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
    );
};

export default StaffDirectory;