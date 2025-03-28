import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/utils/AuthProvider";
import proxy from "@/utils/proxy";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useToast } from "@/utils/ToastProvider";

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const { setFeedbackMessage } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetch(`${proxy}/user/under/${user.manager_id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setUsers(data);
        })
        .catch((err) => {
          setUsers([]);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) {
      fetch(`${proxy}/message/${user.id}/${selectedUser.id}`)
        .then((res) => res.json())
        .then((data) => setMessages(data));
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
      setFeedbackMessage({
        title: "Failed to Send Message",
        description: err.message,
      });
    }
  };

  return (
    <>
      {user && (
        <div className="fixed bottom-5 right-5">
          <div className="relative">
            {/* Toggle Button with Transition */}
            <Button
              ref={toggleButtonRef}
              onClick={() => setIsOpen(true)}
              size="icon"
              variant="default"
              className={`rounded-full shadow-lg absolute bottom-0 right-0 transition-all duration-200 ease-in-out ${
                isOpen
                  ? "opacity-0 scale-0 pointer-events-none"
                  : "opacity-100 scale-100"
              }`}
            >
              <MessageSquare size={24} />
            </Button>

            {/* Chat Card with Transition */}
            <Card
              ref={chatRef}
              className={`w-80 relative transition-all duration-200 ease-in-out transform origin-bottom-right ${
                isOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <Button
                className="absolute top-2 right-2"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </Button>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                  Message people in your department
                </CardDescription>
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
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
