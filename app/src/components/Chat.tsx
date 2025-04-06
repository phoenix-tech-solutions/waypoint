import React, { useState, useRef, FormEvent } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "./ui/button.tsx";
import showdown from "showdown";

const ChatWithBirdie: React.FC = () => {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const converter = new showdown.Converter();
  
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
        body: JSON.stringify({ prompt: inputValue }), // look into keeping context ...
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Response from server:", data);
          setMessages([...messages, 
            { type: 'user', content: data.query },
            { type: 'bot', content: data.message }]);
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
  
    interface ChatMessage {
      type: 'user' | 'bot';
      content: string;
    }

    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Load messages from localStorage on component mount
    React.useEffect(() => {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }, []);

    // Save messages to localStorage whenever they change
    React.useEffect(() => {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="text-center w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Chat with Birdie</h1>
        <p className="text-gray-500 mb-8">
        Ask anything about Innovation Academy...
        </p>

        <div className="mb-8 overflow-y-auto max-h-[60vh] space-y-4">
        {messages.map((message, index) => (
            <div
            key={index}
            className={`p-4 rounded-lg ${
            message.type === 'user'
            ? 'bg-orange-100 ml-auto w-fit text-left max-w-[80%]'
            : 'bg-white mr-auto w-fit text-left max-w-[80%] shadow-sm border border-gray-200'
            }`}
            >

            <div
              className="[&>*:not(:last-child)]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>h1]:text-2xl [&>h2]:text-xl [&>h3]:text-lg [&>h4]:text-base [&>h5]:text-sm [&>h6]:text-xs [&>p]:text-gray-700 [&>ul]:mb-4 [&>h1]:mt-4 [&>h2]:mt-3 [&>h3]:mt-2 [&>h4]:mt-2 [&>h5]:mt-2 [&>h6]:mt-2"
              dangerouslySetInnerHTML={{
              __html: converter.makeHtml(message.content),
              }}
            />
            </div>
        ))}
        </div>

        <form onSubmit={handleInputSubmission} 
        className="relative flex items-center">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleInputSubmission(e as unknown as FormEvent<HTMLFormElement>);
            }
          }}
          placeholder={[
          "When is the next IT Flex Friday?",
          "What is Pinnacle Project?",
          "How do I join a club?",
          "When is the next holiday?",
          "Where is Northstar located?"
          ][Math.floor((Date.now() / 3000) % 4)]}
          className="w-full min-h-[3rem] max-h-[10rem] p-4 pr-12 
          rounded-lg resize-none bg-white
          border-2 border-gray-200 outline-none
          focus:border-orange-500 focus:ring-2 focus:ring-orange-200
          shadow-sm transition-all duration-200
          scrollbar-hide"
          style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          rows={1}
        />
        <Button 
          type="submit"
          className="absolute right-4 p-2 h-8 w-8 rounded-full 
          bg-orange-500 hover:bg-orange-600 cursor-pointer"
          disabled={!inputValue.trim()}
        >
          <ArrowUp size={18} className="text-white" />
        </Button>
        </form>
      </div>
      </div>
    );
};

export default ChatWithBirdie;