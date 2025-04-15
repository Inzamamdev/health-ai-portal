
import { useState, useEffect, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ChatMessage from "@/components/ChatMessage";

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
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    full_name: string | null;
    age: number | null;
    gender: string | null;
  }>({
    full_name: null,
    age: null,
    gender: null
  });

  // Reference for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error("No active session:", sessionError);
          return;
        }

        const userId = sessionData.session.user.id;
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, age, gender')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }
        
        if (profileData) {
          console.log("Profile data loaded:", profileData);
          setUserProfile({
            full_name: profileData.full_name,
            age: profileData.age,
            gender: profileData.gender
          });
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Also fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          return;
        }

        const { data: chatData, error: chatError } = await supabase
          .from('chat_history')
          .select('content, role, created_at')
          .eq('user_id', sessionData.session.user.id)
          .order('created_at', { ascending: true })
          .limit(50);
        
        if (chatError) {
          console.error("Error fetching chat history:", chatError);
          return;
        }
        
        if (chatData && chatData.length > 0) {
          console.log("Chat history loaded:", chatData);
          const formattedChatHistory = chatData.map((msg) => ({
            content: msg.content,
            role: msg.role as "user" | "assistant",
            timestamp: new Date(msg.created_at || Date.now()).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          }));
          
          setMessages((prevMessages) => {
            // Keep the welcome message and add the chat history
            return [prevMessages[0], ...formattedChatHistory];
          });
        }
      } catch (error) {
        console.error("Error in fetchChatHistory:", error);
      }
    };

    fetchChatHistory();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newUserMessage = {
      content: inputValue,
      role: "user" as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error("You need to be logged in to use the chatbot");
        setIsLoading(false);
        return;
      }

      // Call the AI analysis edge function
      const response = await fetch(`https://drqcnssxwwvxijbgncsz.supabase.co/functions/v1/ai-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          prompt: inputValue,
          type: 'chat'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.statusText}`);
      }

      const data = await response.json();

      // Create AI response message
      const newAIMessage = {
        content: data.generatedText,
        role: "assistant" as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prevMessages => [...prevMessages, newAIMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get a response. Please try again.");
      
      // Add error message
      const errorMessage = {
        content: "I'm sorry, I couldn't process your request. Please try again later.",
        role: "assistant" as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  const handleTopicClick = (topic: string) => {
    setInputValue(`I have questions about ${topic}`);
  };

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
                      <p className="font-medium">{userProfile.full_name || "Guest User"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Age:</span>
                      <p className="font-medium">{userProfile.age ? userProfile.age.toString() : "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span>
                      <p className="font-medium">{userProfile.gender || "Not specified"}</p>
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
                        onClick={() => handleTopicClick(topic)}
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
                    <ChatMessage 
                      key={index}
                      content={message.content}
                      role={message.role}
                      timestamp={message.timestamp}
                    />
                  ))}
                  <div ref={messagesEndRef} />
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
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90"
                    disabled={isLoading}
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
