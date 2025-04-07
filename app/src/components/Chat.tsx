import React, { useState, useRef, FormEvent, useEffect } from "react";
import { ArrowUp, Bird } from "lucide-react";
import showdown from "showdown";
import { Button } from "./ui/button.tsx";

const ChatWithBirdie: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const converter = new showdown.Converter();

  interface ChatMessage {
    type: "user" | "bot";
    content: string;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleInputSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = { type: "user", content: inputValue };
    setInputValue("");
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputValue }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: data.message },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }

    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="w-full h-full max-w-7xl mx-auto flex flex-col px-4 pt-13 pb-3">
      {isEmpty ? (
        <div className="flex flex-col justify-center items-center flex-grow text-center">
          <h1 className="text-3xl font-bold mb-2">Chat with Birdie</h1>
          <p className="text-gray-500 mb-8">
            Ask anything about Innovation Academy...
          </p>
          <form
            onSubmit={handleInputSubmission}
            className="relative flex items-center w-full max-w-xl"
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleInputSubmission(e as unknown as FormEvent<HTMLFormElement>);
                }
              }}
              placeholder={[
                "When is the next IT Flex Friday?",
                "What is Pinnacle Project?",
                "How do I join a club?",
                "When is the next holiday?",
                "Where is Northstar located?",
              ][Math.floor((Date.now() / 3000) % 4)]}
              className="w-full min-h-[3rem] max-h-[10rem] p-4 pr-12 
              rounded-lg resize-none bg-white
              border-2 border-gray-200 outline-none
              focus:border-orange-500 focus:ring-2 focus:ring-orange-200
              shadow-sm transition-all duration-200
              overflow-y-auto no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
      ) : (
        <div className="flex flex-col flex-grow min-h-0">
          <div
            className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.type === "user"
                    ? "bg-orange-100 ml-auto w-fit text-left max-w-[80%]"
                    : "bg-white mr-auto w-fit text-left max-w-[80%] shadow-sm border border-gray-200"
                }`}
              >
                <div
                  className="[&>*:not(:last-child)]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>h1]:text-2xl 
                  [&>h2]:text-xl [&>h3]:text-lg [&>h4]:text-base [&>h5]:text-sm [&>h6]:text-xs 
                  [&>p]:text-gray-700 [&>ul]:mb-4 [&>h1]:mt-4 [&>h2]:mt-3 [&>h3]:mt-2 
                  [&>h4]:mt-2 [&>h5]:mt-2 [&>h6]:mt-2"
                  dangerouslySetInnerHTML={{
                    __html: converter.makeHtml(message.content),
                  }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-left">
                <div className="animate-bounce mb-4">
                  <Bird size={32} className="text-orange-500" />
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <form
            onSubmit={handleInputSubmission}
            className="relative flex items-center mt-4"
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleInputSubmission(e as unknown as FormEvent<HTMLFormElement>);
                }
              }}
              placeholder={[
                "When is the next IT Flex Friday?",
                "What is Pinnacle Project?",
                "How do I join a club?",
                "When is the next holiday?",
                "Where is Northstar located?",
              ][Math.floor((Date.now() / 3000) % 4)]}
              className="w-full min-h-[3rem] max-h-[10rem] p-4 pr-12 
              rounded-lg resize-none bg-white
              border-2 border-gray-200 outline-none
              focus:border-orange-500 focus:ring-2 focus:ring-orange-200
              shadow-sm transition-all duration-200
              overflow-y-auto custom-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
      )}
    </div>
  );
};

export default ChatWithBirdie;
