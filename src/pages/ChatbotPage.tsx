
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

const ChatbotPage = () => {
  const [messages, setMessages] = useState<{
    content: string;
    role: "user" | "assistant";
    timestamp: string;
  }[]>([
    {
      content: "Hello! I'm your AI Doctor Assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage = {
      content: inputValue,
      role: "user" as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      const newAIMessage = {
        content: "I understand your concern. Based on the symptoms you've described, this could be related to several conditions. However, I'd need more information to provide a better assessment. Could you please tell me if you're experiencing any other symptoms?",
        role: "assistant" as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prevMessages => [...prevMessages, newAIMessage]);
    }, 1000);
  };

  const commonTopics = [
    "Headaches & Migraines",
    "Cold & Flu Symptoms",
    "Allergies",
    "Stomach Issues",
    "Sleep Problems",
    "Skin Rashes",
    "Joint Pain",
    "Breathing Difficulties"
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Chat Bot / General Care</h1>
          <p className="text-gray-600 mb-8">
            Talk to our AI assistant about general health concerns and get instant guidance
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Patient Info</h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="font-medium">Guest User</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Age:</span>
                      <p className="font-medium">Not specified</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span>
                      <p className="font-medium">Not specified</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Common Topics</h2>
                  <div className="space-y-2">
                    {commonTopics.map((topic, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="md:col-span-3 flex flex-col h-[600px]">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
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
                </div>

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
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatbotPage;
