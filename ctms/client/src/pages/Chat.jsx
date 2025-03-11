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
  const chatRef = useRef(null);

  // Fetch message history when a recipient is selected
  useEffect(() => {
    if (recipient) {
      fetchMessageHistory(user.id, recipient);
    }
  }, [recipient]);

  // Connect to Socket.IO and handle real-time updates
  useEffect(() => {
    if (user) {
      socket.emit("join", user.id); // Send user ID to backend
    }
    // Listen for online users updates
    socket.on("updateUsers", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });
    // Listen for new messages
    socket.on("receiveMessage", (messageData) => {
      console.log("New message received:", messageData);
      setMessages((prev) => [...prev, messageData]);
    });
    // Cleanup on unmount
    return () => {
      socket.off("updateUsers");
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [user]);

  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch message history from the backend
  const fetchMessageHistory = async (userId1, userId2) => {
    try {
      const response = await fetch(
        `http://localhost:15000/message/history/${userId1}/${userId2}`
      );
      const data = await response.json();
      setMessages(data); // Update the messages state
    } catch (err) {
      console.error("Error fetching message history:", err);
    }
  };

  // Send a new message
  const sendMessage = () => {
    if (newMessage.trim() !== "" && recipient.trim() !== "") {
      const messageData = {
        sender: user.id, // Sender ID
        recipient, // Recipient ID
        text: newMessage, // Message content
      };
      console.log("Sending message:", messageData);
      socket.emit("sendMessage", messageData); // Send message to backend
      setNewMessage(""); // Clear input
    }
  };

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
                  onClick={() => setRecipient(userId)}
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
            <div ref={chatRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
