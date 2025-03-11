import React, { useState, useEffect, useRef } from "react";
// import io from "socket.io-client"; // Commented out Socket.IO
import proxy from "@/src/utils/proxy";
import { useAuth } from "@/utils/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// const socket = io(proxy); // Commented out Socket.IO initialization

const Chat = () => {
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const pollInterval = useRef(null); // Add ref for polling interval

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Add this near other state declarations

  // Fetch users under manager
  useEffect(() => {
    fetch(`${proxy}/user/under/${user.manager_id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setOnlineUsers(data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setOnlineUsers([]);
      });
  }, [user?.manager_id]);

  // Poll for new messages every 3 seconds when a recipient is selected
  useEffect(() => {
    if (user && recipient) {
      // Initial fetch
      fetchMessages();

      // Set up polling
      pollInterval.current = setInterval(fetchMessages, 3000);

      // Cleanup
      return () => {
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
        }
      };
    }
  }, [recipient, user]);

  // Function to fetch messages
  const fetchMessages = () => {
    if (!user?.id || !recipient?.id) return;

    setIsLoading(true);
    fetch(`${proxy}/message/${user.id}/${recipient.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Ensure data is an array
        const messageArray = Array.isArray(data) ? data : [];
        setMessages(messageArray);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setMessages([]); // Reset to empty array on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Add scroll to bottom effect when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add send message handler
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !recipient) return;

    const messageData = {
      sender_id: user.id,
      recipient_id: recipient.id,
      text: newMessage.trim(),
    };

    try {
      const response = await fetch(`${proxy}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const savedMessage = await response.json();

      // Update local messages immediately
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Add keypress handler for Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    window.location.href = "/login";
  }

  const dateToTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-background mt-18">
      {/* Sidebar Card */}
      <Card className="w-1/4 border-r rounded-none gap-0">
        <CardHeader>
          <CardTitle>Online Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-2 p-4">
              {onlineUsers.map((onlineUser) => (
                <Button
                  key={onlineUser.id}
                  variant={
                    recipient?.id === onlineUser.id ? "default" : "secondary"
                  }
                  className="w-full justify-start"
                  onClick={() => setRecipient(onlineUser)}
                >
                  <span className="truncate">
                    {onlineUser.display_name} &nbsp;{" "}
                    <span className="text-muted-foreground">
                      (@{onlineUser.username})
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area Card */}
      <Card className="flex flex-col w-3/4 rounded-none border-l-0 p-0 gap-0">
        <CardHeader className="border-b">
          <CardTitle className="text-lg my-4">
            {recipient
              ? `Chat with ${recipient.display_name || recipient.username}`
              : "Select a chat"}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-4 p-4">
              {Array.isArray(messages) &&
                messages
                  .filter(
                    (msg) =>
                      msg &&
                      ((msg.sender_id === user?.id &&
                        msg.recipient_id === recipient?.id) ||
                        (msg.sender_id === recipient?.id &&
                          msg.recipient_id === user?.id))
                  )
                  .map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={cn("flex", {
                        "justify-end": msg.sender_id === user?.id,
                        "justify-start": msg.sender_id !== user?.id,
                      })}
                    >
                      <div
                        className={cn("max-w-[80%] rounded-lg p-3 text-sm", {
                          "bg-primary text-primary-foreground":
                            msg.sender_id === user?.id,
                          "bg-muted": msg.sender_id !== user?.id,
                        })}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 text-right mt-1">
                          {dateToTimeAgo(new Date(msg.sent_at))}
                        </p>
                      </div>
                    </div>
                  ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4">
          <div className="flex gap-2 w-full">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 h-24"
              disabled={!recipient}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!recipient || !newMessage.trim()}
            >
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chat;
