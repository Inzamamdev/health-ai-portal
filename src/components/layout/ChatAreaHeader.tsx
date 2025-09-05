import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
function ChatAreaHeader({ handleNewChat, isLoading }) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chat Bot / General Care</h1>
        <Button
          onClick={handleNewChat}
          className=" hover:bg-gray-600"
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <p className="text-gray-600 mb-8">
        Talk to our AI assistant about general health concerns and get instant
        guidance
      </p>
    </>
  );
}

export default ChatAreaHeader;
