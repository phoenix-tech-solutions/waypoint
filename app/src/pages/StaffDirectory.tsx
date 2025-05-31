import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { Card } from "../components/ui/card.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog.tsx";
import staffData from "../tmp/staff.json";
import { supabase } from "../lib/utils.ts"; // Use exported Supabase client

const StaffDirectory = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login"); // Redirect to login page after logout
  };

  const categorizeStaff = (staff: typeof staffData) => {
    const categories: Record<string, typeof staffData> = {
      "Administrative Staff": [],
      "High School Teachers": [],
      "TAG Teachers": [],
      "CTAE Teachers": [],
      "Counselors": [],
      "Support Staff": [],
    };

    staff.forEach((member) => {
      if (member.title.includes("Principal") || member.title.includes("Registrar")) {
        categories["Administrative Staff"].push(member);
      } else if (member.title.includes("Teacher-TAG")) {
        categories["TAG Teachers"].push(member);
      } else if (member.title.includes("Teacher-CTAE")) {
        categories["CTAE Teachers"].push(member);
      } else if (member.title.includes("Teacher")) {
        categories["High School Teachers"].push(member);
      } else if (member.title.includes("Counselor")) {
        categories["Counselors"].push(member);
      } else {
        categories["Support Staff"].push(member);
      }
    });

    Object.keys(categories).forEach((key) => {
      categories[key].sort((a, b) => {
        const lastNameA = a.name.split(" ").slice(-1)[0];
        const lastNameB = b.name.split(" ").slice(-1)[0];
        return lastNameA.localeCompare(lastNameB);
      });
    });

    const adminStaff = categories["Administrative Staff"];
    const kentIndex = adminStaff.findIndex((member) => member.name.includes("Kent"));
    if (kentIndex > -1) {
      const kent = adminStaff.splice(kentIndex, 1)[0];
      adminStaff.unshift(kent);
    }

    return categories;
  };

  const groupedStaff = categorizeStaff(staffData);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const filteredStaff = Object.entries(groupedStaff).reduce((acc, [category, members]) => {
    if (filterCategory !== "All" && category !== filterCategory) return acc;

    const filteredMembers = members.filter((member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredMembers.length > 0) {
      acc[category] = filteredMembers;
    }

    return acc;
  }, {} as typeof groupedStaff);

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 bg-white dark:bg-gray-800 dark:text-gray-100">
      <div className="sticky top-2 z-10 mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/chat")}
          className="inline-flex items-center text-gray-700 hover:underline bg-white/80 backdrop-blur rounded-md px-2 py-1 dark:text-gray-300 dark:bg-gray-800"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button> 
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8 dark:text-gray-100">
        <span className="flex items-center justify-center gap-2">
          <Briefcase size={28} />
          Staff Directory
        </span>
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
        <select
          title="Filter by category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full sm:w-1/2 md:w-1/4 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        >
          <option value="All">All Categories</option>
          {Object.keys(groupedStaff).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(filteredStaff).map(([category, members]) => (
            <div key={category} className="rounded-lg border shadow-sm overflow-hidden dark:border-gray-700 dark:bg-gray-800">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                <span className="text-xl font-semibold text-orange-500">{category}</span>
                {expandedCategory === category ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-white transition-all dark:bg-gray-800">
                {members
                  .slice(0, expandedCategory === category ? members.length : 3)
                  .map((member) => (
                    <Card
                      key={member.email}
                      className="p-4 shadow hover:shadow-lg transition-transform hover:scale-[1.02] border rounded-xl flex flex-col justify-between dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{member.name}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.title}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="mt-4 text-sm font-medium text-orange-600 hover:underline">
                            View Details
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:text-gray-100">
                          <DialogHeader>
                            <DialogTitle>{member.name}</DialogTitle>
                            <DialogDescription>{member.title}</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                              Email: {member.email}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ))}
              </div>

              {expandedCategory !== category && members.length > 3 && (
                <div className="bg-gray-50 px-6 py-3 text-center dark:bg-gray-700">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="text-sm hover:underline dark:text-gray-300"
                  >
                    + {members.length - 3} more
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDirectory;
