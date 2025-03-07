import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/utils/AuthProvider";
import proxy from "@/src/utils/proxy";

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRef = useRef(null);
  const toggleButtonRef = useRef(null);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          !chatRef.current?.contains(event.target) && 
          !toggleButtonRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetch(`${proxy}/user`)
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error("Error fetching users:", err));
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
        <button
          ref={toggleButtonRef}
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-white text-white p-4 rounded-full shadow-lg flex items-center justify-center
                     dark:bg-primary dark:hover:bg-black transition duration-300"
        >
          <MessageSquare className="text-white dark:text-black hover:text-black dark:hover:text-white transition duration-300" size={24} />
        </button>
      )}

      {isOpen && (
        <div
          ref={chatRef}
          className="w-80 p-4 rounded-2xl shadow-lg border transition-colors duration-300
                     bg-white text-black border-gray-300 hover:bg-gray-100
                     dark:bg-slate-800 dark:text-white dark:border-gray-700 dark:hover:bg-slate-700"
        >
          <div className="flex justify-between items-center border-b pb-2 mb-3
                           dark:border-gray-600">
            <h2 className="text-lg font-bold">Chat</h2>
            <div className="flex gap-2">
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
          </div>

          <select
            className="w-full p-2 mb-3 rounded-lg border dark:bg-slate-700 dark:border-gray-600"
            value={selectedUser?.id || ""}
            onChange={(e) =>
              setSelectedUser(users.find((user) => user.id === parseInt(e.target.value)))
            }
          >
            <option value="">Select a user...</option>
            {users
              .filter((u) => u.id !== user?.id)
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
          </select>

          <div className="h-60 overflow-y-auto p-3 rounded-xl mb-3 border
                           bg-opacity-30 dark:border-gray-600">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded-xl w-fit ${
                    msg.sender_id === user?.id 
                      ? "bg-blue-500 ml-auto" 
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                >
                  <strong>
                    {msg.sender_id === user?.id ? "You" : selectedUser?.username}:
                  </strong>{" "}
                  {msg.text}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No messages yet. Start chatting!</p>
            )}
          </div>

          <div className="flex items-center border-t pt-2 dark:border-gray-600">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="p-3 rounded-xl w-full border dark:bg-slate-700 dark:border-gray-600"
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage} 
              className="ml-2 bg-primary text-white p-3 rounded-xl hover:bg-primary-dark
                         dark:bg-black dark:text-white dark:hover:bg-gray-800 transition duration-300"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;