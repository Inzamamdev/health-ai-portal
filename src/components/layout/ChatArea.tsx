import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Send, Square } from "lucide-react";
function ChatArea({
  isLoading,
  setIsLoading,
  inputValue,
  setInputValue,

  messages,
  setMessages,
}) {
  const { user } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<AbortController | null>(null);
  const [isStreamDone, setIsStreamDone] = useState(true);
  const SERVER_URL = import.meta.env.VITE_OPENAI_SERVER_URL;
  const responseRef = useRef("");
  // Fetch user profile

  // Load chat history
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("chat_history")
          .select("role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });
        if (error) {
          console.error("Error fetching chat history:", error);
          toast.error("Failed to load chat history");
        } else if (data) {
          setMessages((prevMessages) => [
            prevMessages[0], // Keep initial assistant message
            ...data.map((msg) => ({
              content: msg.content,
              role: msg.role as "user" | "assistant",
              timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            })),
          ]);
        }
      }
    };
    fetchHistory();
  }, [user]);

  // Auto-scroll to bottom when messages change

  // Handle New Chat

  const handleSendMessage = async () => {
    const newController = new AbortController();
    setController(newController);
    if (!inputValue.trim() || isLoading) return;

    const newUserMessage = {
      content: inputValue,
      role: "user" as const,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (!user) {
        toast.error("You need to be logged in to use the chatbot");
        setIsLoading(false);
        return;
      }

      // Get session for access token
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error("You need to be logged in to use the chatbot");
        setIsLoading(false);
        return;
      }
      const accessToken = sessionData.session.access_token;

      const assistantIndex = messages.length + 1;

      // Call Node.js server
      const response = await fetch(`${SERVER_URL}/ai-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt: inputValue,
          type: "chat",
          userId: user.id,
        }),
        signal: newController.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.statusText}`);
      }

      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      // Save user message to database
      const { error: userMessageError } = await supabase
        .from("chat_history")
        .insert([{ role: "user", content: inputValue, user_id: user.id }]);
      if (userMessageError) {
        console.error("Error saving user message:", userMessageError);
      }

      // Create AI response message
      while (true) {
        const { done, value } = await reader.read();
        setIsStreamDone(done);
        if (value) setIsLoading(false);
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        responseRef.current += chunk;
        await delay(100);
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = {
            ...updated[assistantIndex],
            content: responseRef.current,
          };
          return updated;
        });
      }

      // Save AI response to database
      const { error: aiMessageError } = await supabase
        .from("chat_history")
        .insert([
          { role: "assistant", content: responseRef.current, user_id: user.id },
        ]);
      if (aiMessageError) {
        console.error("Error saving AI message:", aiMessageError);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Stream aborted by user");

        // ✅ Save partial response to DB
        const { error: aiMessageError } = await supabase
          .from("chat_history")
          .insert([
            {
              role: "assistant",
              content: responseRef.current, // partial message
              user_id: user.id,
            },
          ]);

        if (aiMessageError) {
          console.error("Error saving aborted AI message:", aiMessageError);
        }
      } else {
        const errorMessage = {
          content:
            "I'm sorry, I couldn't process your request. Please try again later.",
          role: "assistant" as const,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        console.error("Error sending message:", error);
        toast.error("Failed to get a response. Please try again.");
      }
    }
  };

  const handleStream = () => {
    controller?.abort();
    setIsStreamDone(!isStreamDone);
  };
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="md:col-span-3 flex flex-col h-[600px]">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Scrollable Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 break-words ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="text-sm">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 text-gray-800">
                <div className="text-sm animate-pulse">...</div>
                <div className="text-xs mt-1 text-gray-500">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Section */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Type your health concern..."
            disabled={isLoading}
          />
          {isStreamDone ? (
            <Button
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleStream}
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              <Square className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatArea;
