import React, { useState } from "react";
import { Card } from "../components/ui/card.tsx";
import { ArrowLeft } from "lucide-react";
import { clubs } from "../tmp/data.ts";

interface Club {
    id: string;
    name: string;
    leader: string;
    sponsor: string;
    description: string;
}

type ClubView = null | Club; // You can view either a club in detail or a list of clubs. Using `null` is probably bad semantics here.

const ClubDirectory = ({ setActiveView }) => {
    const [selectedClub, setSelectedClub] = useState<ClubView>(null);


    const handleClubClick = (club: Club) => {
        setSelectedClub(club);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Center the content */}
            {!selectedClub && (<>
                <button
                onClick={() => setActiveView("chat")}
                className="flex items-center mb-4 text-gray-700 hover:underline cursor-pointer"
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
            </>)}

            {selectedClub && (
                <div className="w-full max-w-2xl mx-auto">
                    {/* Center the content */}
                    <button
                    onClick={() => setSelectedClub(null)}
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
        </div>
    );
};

export default ClubDirectory;