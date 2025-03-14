import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare, PaperclipIcon, Mic, Smile, ChevronDown, Search, Bell, ArrowDownCircle, CheckCircle } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const [notification, setNotification] = useState(null);
  const [messageStatus, setMessageStatus] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const chatRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchRecentChats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      markAsRead(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    // Set up polling for new messages when the chat is open
    const interval = isOpen ? setInterval(checkNewMessages, 5000) : null;
    return () => interval && clearInterval(interval);
  }, [isOpen, selectedUser]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${proxy}/user/under/${user.manager_id}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  const fetchRecentChats = async () => {
    try {
      const res = await fetch(`${proxy}/chat/recent/${user.id}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setRecentChats(data);
      
      // Update unread messages count
      const unread = {};
      data.forEach(chat => {
        if (chat.unread_count > 0) {
          unread[chat.user_id] = chat.unread_count;
        }
      });
      setUnreadMessages(unread);
    } catch (err) {
      console.error("Error fetching recent chats:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${proxy}/message/${user.id}/${selectedUser.id}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setMessages(data);
      
      // Update message statuses
      const statuses = {};
      data.forEach(msg => {
        statuses[msg.id] = msg.status || "sent";
      });
      setMessageStatus(statuses);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const checkNewMessages = async () => {
    if (!selectedUser) return;
    
    try {
      const res = await fetch(`${proxy}/message/new/${user.id}/${selectedUser.id}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      
      if (data.length > 0) {
        setMessages(prev => [...prev, ...data]);
        markAsRead(selectedUser.id);
      }
    } catch (err) {
      console.error("Error checking new messages:", err);
    }
  };

  const markAsRead = async (userId) => {
    try {
      await fetch(`${proxy}/message/read/${user.id}/${userId}`, {
        method: "POST"
      });
      
      // Update unread count locally
      setUnreadMessages(prev => {
        const updated = {...prev};
        delete updated[userId];
        return updated;
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender_id: user.id,
      recipient_id: selectedUser.id,
      text: newMessage,
    };

    // Optimistically add message to UI
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      ...messageData,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    
    // Set initial status
    setMessageStatus(prev => ({...prev, [tempId]: "sending"}));

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
      
      // Replace temp message with actual message
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? newMsg : msg
      ));
      
      // Update status
      setMessageStatus(prev => {
        const updated = {...prev};
        delete updated[tempId];
        updated[newMsg.id] = "delivered";
        return updated;
      });
      
      // Simulate read receipt after 2 seconds
      setTimeout(() => {
        setMessageStatus(prev => ({
          ...prev,
          [newMsg.id]: "read"
        }));
      }, 2000);
      
    } catch (err) {
      console.error("Error sending message:", err);
      // Update status to failed
      setMessageStatus(prev => ({...prev, [tempId]: "failed"}));
      
      // Show error notification
      showNotification("Failed to send message", "error");
    }
  };

  const handleTyping = () => {
    // Send typing indicator to server
    fetch(`${proxy}/typing/${user.id}/${selectedUser.id}`, {
      method: "POST"
    }).catch(err => console.error("Error sending typing indicator:", err));
    
    // Clear previous timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    // Set new timer to stop typing indicator after 2 seconds
    typingTimerRef.current = setTimeout(() => {
      fetch(`${proxy}/typing/${user.id}/${selectedUser.id}/stop`, {
        method: "POST"
      }).catch(err => console.error("Error stopping typing indicator:", err));
    }, 2000);
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resendMessage = async (messageId) => {
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (!failedMessage) return;
    
    // Update status to sending
    setMessageStatus(prev => ({...prev, [messageId]: "sending"}));
    
    try {
      const res = await fetch(`${proxy}/message/resend/${messageId}`, {
        method: "POST"
      });
      
      if (!res.ok) throw new Error("Failed to resend message");
      
      // Update status to delivered
      setMessageStatus(prev => ({...prev, [messageId]: "delivered"}));
      
      // Simulate read receipt after 2 seconds
      setTimeout(() => {
        setMessageStatus(prev => ({...prev, [messageId]: "read"}));
      }, 2000);
      
    } catch (err) {
      console.error("Error resending message:", err);
      setMessageStatus(prev => ({...prev, [messageId]: "failed"}));
    }
  };

  const filteredUsers = users.filter(u => 
    u.id !== user?.id && 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpandChat = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "sending": return <span className="ml-1 text-gray-400 text-xs">•••</span>;
      case "delivered": return <span className="ml-1 text-gray-400"><CheckCircle size={12} /></span>;
      case "read": return <span className="ml-1 text-green-500"><CheckCircle size={12} /></span>;
      case "failed": return <span className="ml-1 text-red-500 cursor-pointer">!</span>;
      default: return null;
    }
  };

  return (
    <>
      {user && (
        <div className="fixed bottom-5 right-5 z-50">
          <div className="relative">
            {/* Notification */}
            {notification && (
              <div className={`absolute -top-12 right-0 p-2 rounded-md shadow-md ${
                notification.type === "error" ? "bg-red-500" : "bg-green-500"
              } text-white text-sm`}>
                {notification.message}
              </div>
            )}
            
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
              {Object.values(unreadMessages).reduce((sum, count) => sum + count, 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(unreadMessages).reduce((sum, count) => sum + count, 0)}
                </span>
              )}
            </Button>

            {/* Chat Card with Transition */}
            <Card
              ref={chatRef}
              className={`relative transition-all duration-200 ease-in-out transform origin-bottom-right ${
                isOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              } ${
                isExpanded ? "w-96 h-[600px]" : "w-80 h-[480px]"
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
              <Button
                className="absolute top-2 right-10"
                variant="ghost"
                size="icon"
                onClick={toggleExpandChat}
              >
                <ChevronDown size={20} className={`transform ${isExpanded ? "rotate-180" : ""}`} />
              </Button>
              <CardHeader className="pb-2">
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                  Message people in your department
                </CardDescription>
              </CardHeader>

              <Tabs defaultValue="chats" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mx-4">
                  <TabsTrigger value="chats">Recent Chats</TabsTrigger>
                  <TabsTrigger value="people">People</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chats" className="p-0">
                  <CardContent className="p-2">
                    {recentChats.length > 0 ? (
                      <ScrollArea className="h-56">
                        <div className="space-y-2">
                          {recentChats.map((chat) => (
                            <div 
                              key={chat.user_id}
                              className={`p-2 flex items-center gap-2 rounded-md cursor-pointer hover:bg-muted ${
                                selectedUser?.id === chat.user_id ? "bg-muted" : ""
                              }`}
                              onClick={() => {
                                const chatUser = users.find(u => u.id === chat.user_id);
                                if (chatUser) setSelectedUser(chatUser);
                              }}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{chat.username?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between">
                                  <span className="font-medium">{chat.username}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(chat.last_message_time), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {chat.last_message}
                                </p>
                              </div>
                              {unreadMessages[chat.user_id] > 0 && (
                                <Badge variant="destructive" className="rounded-full">
                                  {unreadMessages[chat.user_id]}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="h-56 flex items-center justify-center text-muted-foreground">
                        No recent chats. Start a conversation!
                      </div>
                    )}
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="people" className="p-0">
                  <CardContent className="p-2">
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <ScrollArea className="h-48">
                      {filteredUsers.length > 0 ? (
                        <div className="space-y-2">
                          {filteredUsers.map((usr) => (
                            <div 
                              key={usr.id}
                              className={`p-2 flex items-center gap-2 rounded-md cursor-pointer hover:bg-muted ${
                                selectedUser?.id === usr.id ? "bg-muted" : ""
                              }`}
                              onClick={() => setSelectedUser(usr)}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{usr.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="font-medium">{usr.username}</span>
                                <p className="text-xs text-muted-foreground">
                                  {usr.department || "No department"}
                                </p>
                              </div>
                              {unreadMessages[usr.id] > 0 && (
                                <Badge variant="destructive" className="rounded-full">
                                  {unreadMessages[usr.id]}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          No users found
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </TabsContent>
              </Tabs>
              
              {selectedUser ? (
                <>
                  <div className="px-4 py-2 border-t border-b flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{selectedUser.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{selectedUser.username}</span>
                    {isTyping && <span className="text-xs text-muted-foreground ml-2">typing...</span>}
                  </div>
                  
                  <ScrollArea className={`p-2 ${isExpanded ? 'h-[400px]' : 'h-[280px]'}`}>
                    <div className="space-y-2 p-2">
                      {messages.length > 0 ? (
                        messages.map((msg, index) => (
                          <div
                            key={msg.id}
                            className={`mb-2 p-2 rounded-xl max-w-[80%] ${
                              msg.sender_id === user?.id
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-muted"
                            }`}
                          >
                            <div className="flex flex-col">
                              <span>{msg.text}</span>
                              <div className="flex items-center justify-end mt-1">
                                <span className="text-xs opacity-70">
                                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                </span>
                                {msg.sender_id === user?.id && (
                                  <>
                                    {messageStatus[msg.id] === "failed" ? (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span 
                                              className="ml-1 text-red-500 cursor-pointer"
                                              onClick={() => resendMessage(msg.id)}
                                            >
                                              !
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Failed to send. Click to retry.</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    ) : (
                                      getStatusIcon(messageStatus[msg.id])
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No messages yet. Start chatting!
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <CardFooter className="flex items-center gap-2 pt-2">
                    <div className="flex-1 flex gap-2 items-center border rounded-md pr-2">
                      <Input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        className="flex-1 border-0 focus-visible:ring-0"
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Smile size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add emoji</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <PaperclipIcon size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Attach file</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send size={18} />
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-4">
                  <MessageSquare size={40} className="mb-2" />
                  <p className="text-center">Select a user to start chatting</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;