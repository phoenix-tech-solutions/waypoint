import React, { useState } from "react";
import { Card } from "../components/ui/card.tsx";
import { ArrowLeft, Users } from "lucide-react";
import { clubs } from "../tmp/data.ts";
import { useNavigate } from "react-router-dom";

interface Club {
    id: string;
    name: string;
    leader: string;
    sponsor: string;
    description: string;
}

type ClubView = null | Club;

const ClubDirectory = () => {
    const [selectedClub, setSelectedClub] = useState<ClubView>(null);
    const navigate = useNavigate();

    const handleClubClick = (club: Club) => {
        setSelectedClub(club);
    };

    return (
        <div className="w-full h-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-8 bg-white dark:bg-gray-800 dark:text-gray-100">
            {!selectedClub && (<>
                <button
                onClick={() => navigate("/chat")}
                className="flex items-center mb-4 text-gray-700 hover:underline cursor-pointer dark:text-gray-300"
                >
                <ArrowLeft size={16} className="mr-1" /> Back
                </button>
                <h1 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                  <Users size={24} /> Clubs Info
                </h1>{" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {clubs.map((club) => (
                        <Card
                        key={club.id}
                        className="p-4 cursor-pointer transition transform hover:scale-105 shadow-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                        onClick={() => handleClubClick(club)}
                        >
                        <h2 className="text-xl font-bold">{club.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">Leader: {club.leader}</p>
                        <p className="text-gray-600 dark:text-gray-400">Sponsor: {club.sponsor}</p>
                        </Card>
                    ))}
                </div>
            </>)}

            {selectedClub && (
                <div className="w-full max-w-2xl mx-auto">
                    <button
                    onClick={() => setSelectedClub(null)}
                    className="flex items-center mb-4 text-gray-700 hover:underline dark:text-gray-300"
                    >
                    <ArrowLeft size={16} className="mr-1" /> Back
                    </button>
                    <Card className="p-6 transition transform hover:scale-105 shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                    <h1 className="text-3xl font-bold mb-2">{selectedClub.name}</h1>
                    <p className="mb-2 text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Leader:</span>{" "}
                        {selectedClub.leader}
                    </p>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Sponsor:</span>{" "}
                        {selectedClub.sponsor}
                    </p>
                    <p className="text-gray-500 dark:text-gray-300">{selectedClub.description}</p>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ClubDirectory;