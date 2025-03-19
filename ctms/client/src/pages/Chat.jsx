import React, { useState, useEffect, useRef, useMemo } from "react";
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

const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (seconds < 10) return "Just now";
  return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
};

const Message = ({ msg, user }) => {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatTimeAgo(new Date(msg.sent_at)));
    };

    updateTimeAgo(); // Initial calculation
    const interval = setInterval(updateTimeAgo, 60000); // Update every 60s

    return () => clearInterval(interval); // Cleanup on unmount
  }, [msg.sent_at]);

  return (
    <div
      className={`flex ${
        msg.sender_id === user?.id ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 text-sm ${
          msg.sender_id === user?.id
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <p>{msg.text}</p>
        <p
          className={`text-xs opacity-70 mt-1 ${
            msg.sender_id === user?.id ? "text-right" : "text-left"
          }`}
        >
          {timeAgo}
        </p>
      </div>
    </div>
  );
};

const Chat = () => {
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const socketRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  const onlineUsers = useMemo(
    () => fetchedUsers.filter((user) => user.is_online),
    [fetchedUsers]
  );

  const offlineUsers = useMemo(
    () => fetchedUsers.filter((user) => !user.is_online),
    [fetchedUsers]
  );

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // don't emit typing events if not in a conversation
    if (!recipient || !socketRef.current) return;

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit("typing", {
        senderId: user.id,
        receiverId: recipient.id,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set a new time out
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current.emit("stopTyping", {
        senderId: user.id,
        receiverId: recipient.id,
      });
    }, 1000);
  };

  // **********************************
  // Socket.io connection handling (NO POLLING)
  // **********************************
  useEffect(() => {
    if (!user?.id) return;

    // Create socket connection
    socketRef.current = io(proxy, {
      withCredentials: true,
    });

    // Force a rejoin to ensure user status is updated
    socketRef.current.emit("join", user.id);

    // Listen for message refetch events
    socketRef.current.on("refetchMessages", (data) => {
      console.log("Received refetchMessages event:", data);

      // Only refetch if we're currently viewing this conversation
      if (recipient && data.partnerId === recipient.id) {
        fetchMessages();
      } else if (data.partnerId) {
        // Optionally handle notifications for messages from other users
        // This could update an unread count or show a notification
        console.log(`New message from user ${data.partnerId}`);

        // If you want to implement notifications, you could update state here
        // For example: setUnreadMessages(prev => ({...prev, [data.partnerId]: (prev[data.partnerId] || 0) + 1}));
      }
    });

    // Listen for typing events
    socketRef.current.on("userTyping", (data) => {
      if (recipient && data.senderId === recipient.id) {
        setIsRecipientTyping(data.isTyping);
      }
    });

    // Listen for user status changes
    socketRef.current.on("userStatusChange", ({ userId, isOnline }) => {
      setFetchedUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_online: isOnline } : user
        )
      );
    });

    return () => {
      // Clean up socket connection
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user?.id, recipient]);

  // Reset typing state when changing recipients
  useEffect(() => {
    setIsRecipientTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [recipient]);

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
        // convert the date strings to Date objects
        messageArray.forEach((msg) => (msg.sent_at = new Date(msg.sent_at)));
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

  // Scroll to bottom when messages change
  useEffect(() => {
    const currentMessagesLength = messages.length;
    const isInitialLoad =
      prevMessagesLengthRef.current === 0 && messages.length > 0;

    if (
      messages.length > 0 ||
      currentMessagesLength > prevMessagesLengthRef.current ||
      isRecipientTyping ||
      isTyping
    ) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({
          behavior: isInitialLoad ? "instant" : "smooth",
        });
      });
    }

    // Update the ref with current length for next comparison
    prevMessagesLengthRef.current = currentMessagesLength;
  }, [messages, isRecipientTyping, isTyping, recipient]);

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
      setNewMessage("");

      // Stop typing indication
      if (socketRef.current) {
        socketRef.current.emit("stopTyping", {
          senderId: user.id,
          receiverId: recipient.id,
        });
      }

      // Manually fetch messages after sending
      fetchMessages();
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

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-background mt-18">
      {/* Sidebar Card */}
      <Card className="w-1/4 border-r rounded-none gap-0">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 p-4">
              {/* Online Users Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Online
                </h3>
                {onlineUsers.map((fetchedUser) => (
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
                    <Dot size={40} className="text-green-500" />
                    <span className="truncate">@{fetchedUser.username}</span>
                  </div>
                ))}

                {onlineUsers.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2">
                    No users online
                  </p>
                )}
              </div>

              {/* Offline Users Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Offline
                </h3>
                {offlineUsers.map((fetchedUser) => (
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
                    <Dot size={40} className="text-muted-foreground" />
                    <span className="truncate">@{fetchedUser.username}</span>
                  </div>
                ))}

                {offlineUsers.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2">
                    No users offline
                  </p>
                )}
              </div>
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
                        <Message key={msg.id || index} msg={msg} user={user} />
                      ))}

                  {isRecipientTyping && (
                    <div className="animate-fade-in flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 text-sm bg-muted">
                        <p className="flex items-center">
                          <span className="typing-dot animate-pulse">•</span>
                          <span className="typing-dot animate-pulse delay-100">
                            •
                          </span>
                          <span className="typing-dot animate-pulse delay-200">
                            •
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {recipient.username} is typing...
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
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
                  onChange={handleTyping}
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
