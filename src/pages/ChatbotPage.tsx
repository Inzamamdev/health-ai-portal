import { useState, useEffect, useRef } from "react";
import PatientInfoSidebar from "@/components/layout/PatientInfoSidebar";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ChatArea from "@/components/layout/ChatArea";
import { Send, RefreshCw } from "lucide-react"; // Added RefreshCw icon for New Chat
import ChatAreaHeader from "@/components/layout/ChatAreaHeader";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
const ChatbotPage = () => {
  const [messages, setMessages] = useState<
    {
      content: string;
      role: "user" | "assistant";
      timestamp: string;
    }[]
  >([
    {
      content: "Hello! I'm your AI Doctor Assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const handleNewChat = async () => {
    if (user) {
      // Clear chat history from Supabase
      const { error } = await supabase
        .from("chat_history")
        .delete()
        .eq("user_id", user.id);
      if (error) {
        console.error("Error clearing chat history:", error);
        toast.error("Failed to clear chat history");
        return;
      }
    }

    // Reset messages to initial state
    setMessages([
      {
        content:
          "Hello! I'm your AI Doctor Assistant. How can I help you today?",
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInputValue("");
    toast.success("Started a new chat!");
  };
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <ChatAreaHeader handleNewChat={handleNewChat} isLoading={isLoading} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <PatientInfoSidebar setInputValue={setInputValue} />
            {/* Chat Area */}
            <ChatArea
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              inputValue={inputValue}
              setInputValue={setInputValue}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatbotPage;
