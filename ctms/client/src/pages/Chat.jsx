import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import proxy from "@/src/utils/proxy";
import { useAuth } from "@/utils/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const socket = io(proxy);

const Chat = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  if (!user) {
    window.location.href = "/login";
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Online Users</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2">
              {onlineUsers.map((userId, index) => (
                <Button
                  key={index}
                  variant={recipient === userId ? "default" : "secondary"}
                  className="w-full justify-start"
                >
                  User {userId}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {recipient ? `Chat with User ${recipient}` : "Select a chat"}
          </h2>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages
              .filter(
                (msg) =>
                  (msg.sender_id === user.id &&
                    msg.recipient_id === recipient) ||
                  (msg.sender_id === recipient && msg.recipient_id === user.id)
              )
              .map((msg, index) => (
                <div
                  key={index}
                  className={cn("flex", {
                    "justify-end": msg.sender_id === user.id,
                    "justify-start": msg.sender_id !== user.id,
                  })}
                >
                  <div
                    className={cn("max-w-[80%] rounded-lg p-3 text-sm", {
                      "bg-primary text-primary-foreground":
                        msg.sender_id === user.id,
                      "bg-muted": msg.sender_id !== user.id,
                    })}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-70 text-right mt-1">
                      {new Date(msg.sent_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button className="mx-24">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
