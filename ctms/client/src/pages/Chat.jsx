import React, { useState, useEffect, useRef } from "react";
import proxy from "@/utils/proxy";
import { useAuth } from "@/utils/AuthProvider";
import { Button } from "@/components/ui/button";
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
import { Dot, HeartCrack } from "lucide-react";
import { io } from "socket.io-client";

const socket = io(proxy, {
  withCredentials: true,
});

const Chat = () => {
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const prevMessagesLengthRef = useRef(0); // Add ref to track previous message count

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Socket.IO setup
  useEffect(() => {
    if (!user?.id) return;

    // Set up connection
    const onConnect = () => {
      console.log("Connected to server");
      // Tell the server who you are
      socket.emit("user_connected", user.id);
    };

    // Handle new messages
    const onNewMessage = (message) => {
      console.log("New message received:", message);
      // Only add message if it's relevant to current chat
      if (
        recipient &&
        ((message.sender_id === user.id &&
          message.recipient_id === recipient.id) ||
          (message.sender_id === recipient.id &&
            message.recipient_id === user.id))
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Register listeners
    socket.on("connect", onConnect);
    socket.on("new_message", onNewMessage);

    // Clean up
    return () => {
      socket.off("connect", onConnect);
      socket.off("new_message", onNewMessage);
    };
  }, [user?.id, recipient]);

  // Fetch users under manager
  useEffect(() => {
    if (!user?.manager_id) return;
    fetch(`${proxy}/user/under/${user.manager_id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Filter out the current user from the fetched users list
        const filteredUsers = data.filter(
          (fetchedUser) => fetchedUser.id !== user.id
        );
        setFetchedUsers(filteredUsers);
        console.log("Fetched users:", filteredUsers);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setFetchedUsers([]);
      });
  }, [user?.manager_id]);

  // Initial fetch when recipient changes - NO POLLING
  useEffect(() => {
    if (user && recipient) {
      // Just fetch once when recipient changes
      fetchMessages();

      // Reset message length ref
      prevMessagesLengthRef.current = 0;
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

  // Modified scroll effect - only scroll when necessary
  useEffect(() => {
    const currentMessagesLength = messages.length;

    // Only scroll if:
    // 1. There are new messages (length increased)
    // 2. This is the initial load for a recipient (prevLength was 0)
    if (
      currentMessagesLength > prevMessagesLengthRef.current ||
      (prevMessagesLengthRef.current === 0 && currentMessagesLength > 0)
    ) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // Update the ref with current length for next comparison
    prevMessagesLengthRef.current = currentMessagesLength;
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
      // Clear message input immediately for better UX
      setNewMessage("");

      const response = await fetch(`${proxy}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // No need to update messages here - will be handled by socket event
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
    } else if (seconds === 0 || seconds < 10) {
      return "Just now";
    } else {
      return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-background mt-18">
      {/* Sidebar Card */}
      <Card className="w-1/4 border-r rounded-none gap-0">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-2 p-4">
              {fetchedUsers.map((fetchedUser) => (
                <div
                  role="button"
                  key={fetchedUser.id}
                  className={`flex w-full justify-start px-2 rounded-lg items-center
                  ${
                    recipient?.id === fetchedUser.id
                      ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                      : "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
                  }
                    `}
                  onClick={() => setRecipient(fetchedUser)}
                >
                  <Dot
                    size={40}
                    className={
                      recipient?.is_online
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }
                  />
                  <span className="truncate">@{fetchedUser.username}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area Card */}
      <Card className="flex flex-col w-3/4 rounded-none border-l-0 p-0 gap-0">
        {recipient ? (
          <>
            <CardHeader className="border-b">
              <CardTitle className="text-lg my-4">
                {recipient
                  ? `${recipient.display_name || recipient.username}`
                  : "Select a chat"}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-18rem)]">
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
                            className={cn(
                              "max-w-[80%] rounded-lg p-3 text-sm",
                              {
                                "bg-primary text-primary-foreground":
                                  msg.sender_id === user?.id,
                                "bg-muted": msg.sender_id !== user?.id,
                              }
                            )}
                          >
                            <p>{msg.text}</p>
                            <p
                              className={`
                          text-xs opacity-70 mt-1
                          ${
                            msg.sender_id === user?.id
                              ? "text-right"
                              : "text-left"
                          }
                          `}
                            >
                              {dateToTimeAgo(new Date(msg.sent_at))}
                            </p>
                          </div>
                        </div>
                      ))}
                  <div ref={scrollRef} />
                  {messages.length === 0 && !isLoading && (
                    <div className="flex mt-40 justify-center flex-col items-center">
                      <HeartCrack size={64} className="mx-auto" />
                      <p className="text-muted-foreground text-center">
                        No messages yet... what the heck?!
                      </p>
                    </div>
                  )}
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
                  className="flex-1 h-24 resize-none"
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
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-lg text-muted-foreground">
              Select a user to start chatting
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Chat;
