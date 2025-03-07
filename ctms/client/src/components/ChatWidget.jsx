import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/utils/AuthProvider";
import proxy from "@/src/utils/proxy";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetch(`${proxy}/user/under/${user.manager_id}`) // Changed from /user to /user/all based on your API routes
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Users fetched:", data); // Add logging to debug
          setUsers(data);
        })
        .catch((err) => {
          console.error("Error fetching users:", err);
          // Add user feedback for errors
          setUsers([]);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) {
      fetch(`${proxy}/message/${user.id}/${selectedUser.id}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("Error fetching messages:", err));
    }
  }, [selectedUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender_id: user.id,
      recipient_id: selectedUser.id,
      text: newMessage,
    };

    try {
      const res = await fetch(`${proxy}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const newMsg = await res.json();
      setMessages([...messages, newMsg]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="fixed bottom-5 right-5">
      {!isOpen && (
        <Button
          ref={toggleButtonRef}
          onClick={() => setIsOpen(true)}
          size="icon"
          variant="default"
          className="rounded-full shadow-lg"
        >
          <MessageSquare size={24} />
        </Button>
      )}

      {isOpen && (
        <Card ref={chatRef} className="w-80 ">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Chat</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <Select
              value={selectedUser?.id?.toString() || ""}
              onValueChange={(value) => {
                setSelectedUser(
                  users.find((user) => user.id === parseInt(value))
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => u.id !== user?.id)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <ScrollArea className="h-60 rounded-md border">
              <div className="p-3">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 rounded-xl w-fit ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      }`}
                    >
                      <strong>
                        {msg.sender_id === user?.id
                          ? "You"
                          : selectedUser?.username}
                        :
                      </strong>{" "}
                      {msg.text}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No messages yet. Start chatting!
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="flex items-center gap-2 pt-2">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send size={20} />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;
