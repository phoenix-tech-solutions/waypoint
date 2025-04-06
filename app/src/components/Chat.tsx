import React, { useState, useRef } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "./ui/button.tsx";

const ChatWithBirdie: React.FC = () => {
    const [inputValue, setInputValue] = useState("");
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
  
            <form onSubmit={handleInputSubmission} className="relative flex items-center">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={[
                "When is the next IT Flex Friday?",
                "What is Pinnacle Project?",
                "How do I join a club?",
                "When is the next holiday?",
                "Where is Northstar located?"
                ][Math.floor((Date.now() / 3000) % 4)]}
              className="w-full min-h-[3rem] max-h-[10rem] p-4 pr-12 
                rounded-lg resize-none
                bg-gray-50 text-gray-800
                border-2 border-gray-200 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                shadow-sm transition-all duration-200"
              rows={1}
            />
            <Button 
              type="submit"
              className="absolute right-4 p-2 h-8 w-8 rounded-full 
              hover:bg-gray-500 cursor-pointer"
            >
              <ArrowUp size={18} className="text-white" />
            </Button>
            </form>
        </div>
      </div>
    );
};

export default ChatWithBirdie;