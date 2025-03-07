import React, { useState, useEffect } from "react";
import { Send, X, MessageCircle } from "lucide-react"; // Icons for styling
import { useAuth } from "@/utils/AuthProvider";

import proxy from "@/src/utils/proxy";

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Toggle chat visibility
  const [users, setUsers] = useState([]); // List of users
  const [selectedUser, setSelectedUser] = useState(null); // Chat recipient
  const [messages, setMessages] = useState([]); // Chat history
  const [newMessage, setNewMessage] = useState("");

  // Fetch all users when chat opens
  useEffect(() => {
    if (isOpen) {
      fetch(`${proxy}/user`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch users");
          return res.json();
        })
        .then((data) => setUsers(data))
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [isOpen]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetch(`${proxy}/message/${user.id}/${selectedUser.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch messages");
          return res.json();
        })
        .then((data) => setMessages(data))
        .catch((err) => console.error("Error fetching messages:", err));
    }
  }, [selectedUser]);

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender_id: user.id,
      recipient_id: selectedUser.id,
      text: newMessage, // Match column name in DB
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
      setMessages([...messages, newMsg]); // Append the new message
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="fixed bottom-5 right-5">
      {/* Floating Button to Open Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="w-80 bg-slate-800 text-white border border-gray-700 p-4 rounded-2xl shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-3">
            <h2 className="text-lg font-bold">Chat</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Selection */}
          <select
            className="w-full p-2 mb-3 bg-slate-700 text-white rounded-lg"
            value={selectedUser?.id || ""}
            onChange={(e) =>
              setSelectedUser(
                users.find((user) => user.id === parseInt(e.target.value))
              )
            }
          >
            <option value="">Select a user...</option>
            {users
              .filter((user) => user.id !== user.id)
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
          </select>

          {/* Messages Container */}
          <div className="h-60 overflow-y-auto bg-slate-700 p-3 rounded-xl mb-3">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded-xl ${
                    msg.sender_id === user.id
                      ? "bg-blue-500 ml-auto w-fit"
                      : "bg-gray-600"
                  }`}
                >
                  <strong>
                    {msg.sender_id === user.id ? "You" : selectedUser?.username}
                    :
                  </strong>{" "}
                  {msg.text} {/* Match column name in DB */}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No messages yet. Start chatting!</p>
            )}
          </div>

          {/* Input & Send Button */}
          <div className="flex items-center border-t border-gray-600 pt-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="bg-slate-700 text-white p-3 rounded-xl w-full border border-gray-600"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-blue-500 text-white p-3 rounded-xl"
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
