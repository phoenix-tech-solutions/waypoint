import React, { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Bird, Mic, MicOff } from "lucide-react";
import showdown from "showdown";
import { Button } from "./ui/button.tsx";
import jsPDF from "jspdf";
import toast, { Toaster } from "react-hot-toast";

const ChatWithBirdie: React.FC = () => {
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isListening, setIsListening] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const messageEndRef = useRef<HTMLDivElement>(null);
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const converter = new showdown.Converter();

	interface ChatMessage {
		type: "user" | "bot";
		content: string;
	}

	useEffect(() => {
		if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			const recognition = new SpeechRecognition();
			recognition.lang = "en-US";
			recognition.interimResults = false;
			recognitionRef.current = recognition;

			recognition.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setInputValue((prev) => prev + transcript);
			};
			
			recognition.onend = () => {
				setIsListening(false);
			};
		} else {
			console.warn("SpeechRecognition is not supported in this browser.");
		}
	}, []);

	const handleMicClick = () => {
		if (recognitionRef.current) {
			if (isListening) {
				recognitionRef.current.stop();
			} else {
				setIsListening(true);
				recognitionRef.current.start();
			}
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputValue(e.target.value);
		const textarea = inputRef.current;
		if (textarea) {
			textarea.style.height = "auto"; // Reset height to calculate new height
			textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height dynamically
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
			const botMessage: ChatMessage = { type: "bot", content: data.message };
			setMessages((prev) => [...prev, botMessage]);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setIsLoading(false);
		}

		const textarea = inputRef.current;
		if (textarea) {
			textarea.style.height = "auto";
		}
	};

	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const isEmpty = messages.length === 0;

	const exportChatToPDF = () => {
		const pdf = new jsPDF("p", "mm", "a4");
		pdf.setFont("times", "normal");
		pdf.setFontSize(12);

		let yOffset = 10;
		const lineHeight = 10;
		const pageHeight = pdf.internal.pageSize.height;

		messages.forEach((message) => {
			const text = `${message.type === "user" ? "User" : "Birdie"}: ${
				message.content
			}`;
			const textLines = pdf.splitTextToSize(text, 190);

			textLines.forEach((line: string) => {
				if (yOffset + lineHeight > pageHeight - 10) {
					pdf.addPage();
					yOffset = 10;
				}

				if (message.type === "user") {
					pdf.setTextColor(227, 157, 18);
				} else {
					pdf.setTextColor(0, 0, 0);
				}

				pdf.text(line, 10, yOffset);
				yOffset += lineHeight;
			});
		});

		const timestamp = new Date()
			.toLocaleString()
			.replace(/[/,:\s]/g, "_")
			.replace(/_/g, "-");
		pdf.save(`chat_with_birdie_${timestamp}.pdf`);
		toast.success("Chat saved as PDF!");
	};

	return (
		<div className="w-full h-full max-w mx-auto flex flex-col px-4 md:pt-13 pb-2 bg-white dark:bg-gray-800 dark:text-gray-100 relative">
			{messages.length > 0 && (
				<Button
					onClick={exportChatToPDF}
					className="absolute top-4 left-4 sm:left-6 md:left-8 lg:left-10 px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-full shadow-lg transition-all duration-300"
				>
					Save Chat
				</Button>
			)}

			{isEmpty ? (
				<div className="flex flex-col justify-center items-center flex-grow text-center">
					<h1 className="text-3xl font-bold mb-2">
						Chat with <span className="text-orange-500">Birdie</span>
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mb-8">
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
									handleInputSubmission(
										e as unknown as FormEvent<HTMLFormElement>
									);
								}
							}}
							placeholder={
								[
									"When is the next IT Flex Friday?",
									"What is Pinnacle Project?",
									"How do I join a club?",
									"When is the next holiday?",
									"Where is Northstar located?",
								][Math.floor((Date.now() / 3000) % 4)]
							}
							className="w-full min-h-[3rem] max-h-[10rem] p-4 pr-16 
                  rounded-lg resize-none bg-white dark:bg-gray-800
                  border-2 border-gray-200 dark:border-gray-700 outline-none
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-200
                  shadow-sm transition-all duration-200
                  overflow-hidden dark:text-gray-100" // Set overflow to hidden
							rows={1}
						/>
						{!inputValue.trim() ? (
							<Button
								type="button"
								onClick={handleMicClick}
								className={`absolute right-4 p-2 h-10 w-10 rounded-full 
                  ${isListening ? "bg-orange-500" : "bg-gray-500"} hover:bg-gray-600 cursor-pointer flex items-center justify-center`}
							>
								<Mic size={20} className="text-white" />
							</Button>
						) : (
							<Button
								type="submit"
								className="absolute right-4 p-2 h-10 w-10 rounded-full 
          bg-orange-500 hover:bg-orange-600 cursor-pointer flex items-center justify-center"
								disabled={!inputValue.trim()}
							>
								<ArrowUp size={20} className="text-white" />
							</Button>
						)}
					</form>
				</div>
			) : (
				<div className="flex flex-col flex-grow min-h-0">
					<div
						id="chat-history"
						className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar"
					>
						{messages.map((message, index) => (
							<div
								key={index}
								className={`p-4 rounded-lg transition-all duration-500 ease-in-out ${
									message.type === "user"
										? "bg-orange-100 dark:bg-orange-900 ml-auto w-fit text-left max-w-[40%] sm:max-w-[50%] md:max-w-[45%] lg:max-w-[40%] sm:mr-[10%] md:mr-[20%] lg:mr-[25%]"
										: "bg-white dark:bg-gray-800 mr-auto w-fit text-left max-w-[80%] sm:max-w-[70%] md:max-w-[65%] lg:max-w-[30%] sm:ml-[10%] md:ml-[20%] lg:ml-[25%] shadow-sm border border-gray-200 dark:border-gray-700"
								}`}
							>
								<div
									className="[&>*:not(:last-child)]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>h1]:text-2xl 
                      [&>h2]:text-xl [&>h3]:text-lg [&>h4]:text-base [&>h5]:text-sm [&>h6]:text-xs 
                      [&>p]:text-gray-700 dark:[&>p]:text-gray-300 [&>ul]:mb-4 [&>h1]:mt-4 [&>h2]:mt-3 [&>h3]:mt-2 
                      [&>h4]:mt-2 [&>h5]:mt-2 [&>h6]:mt-2"
									dangerouslySetInnerHTML={{
										__html: converter.makeHtml(message.content),
									}}
								/>
							</div>
						))}

						{isLoading && (
							<div className="flex items-center justify-start w-full mx-auto">
								<div className="animate-bounce mt-7 mb-4 ml-[10%] sm:ml-[10%] md:ml-[20%] lg:ml-[25%]">
									<Bird size={32} className="text-orange-500" />
								</div>
							</div>
						)}

						<div ref={messageEndRef} />
					</div>

					<form
						onSubmit={handleInputSubmission}
						className="relative flex items-center mt-4 justify-center w-full max-w-4xl mx-auto"
					>
						<textarea
							ref={inputRef}
							value={inputValue}
							onChange={handleInputChange}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleInputSubmission(
										e as unknown as FormEvent<HTMLFormElement>
									);
								}
							}}
							placeholder={
								[
									"When is the next IT Flex Friday?",
									"What is Pinnacle Project?",
									"How do I join a club?",
									"When is the next holiday?",
									"Where is Northstar located?",
								][Math.floor((Date.now() / 3000) % 4)]
							}
							className="w-full min-h-[3rem] max-h-[10rem] p-4 pr-16 
                  rounded-lg resize-none bg-white dark:bg-gray-800
                  border-2 border-gray-200 dark:border-gray-700 outline-none
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-200
                  shadow-sm transition-all duration-200
                  overflow-hidden custom-scrollbar dark:text-gray-100"
							rows={1}
						/>
						{!inputValue.trim() ? (
							<Button
								type="button"
								onClick={handleMicClick}
								className={`absolute top-1/2 right-4 transform -translate-y-1/2 p-2 h-10 w-10 rounded-full 
                  ${isListening ? "bg-orange-500" : "bg-gray-500"} hover:bg-gray-600 cursor-pointer flex items-center justify-center`}
							>
								<Mic size={20} className="text-white" />
							</Button>
						) : (
							<Button
								type="submit"
								className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 h-10 w-10 rounded-full 
                  bg-orange-500 hover:bg-orange-600 cursor-pointer flex items-center justify-center"
								disabled={!inputValue.trim()}
							>
								<ArrowUp size={20} className="text-white" />
							</Button>
						)}
					</form>
				</div>
			)}

			<Toaster
				position="top-right"
				toastOptions={{
					duration: 4000,
					style: {
						background: "#4CAF50",
						color: "#fff",
						fontSize: "16px",
						padding: "12px",
						borderRadius: "8px",
					},
				}}
			/>
		</div>
	);
};

export default ChatWithBirdie;
