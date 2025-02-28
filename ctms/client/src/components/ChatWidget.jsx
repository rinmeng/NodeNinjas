import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle } from "lucide-react"; // Icons for styling

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false); // Chat visibility toggle
  const [messages, setMessages] = useState([]); // Stores messages
  const [newMessage, setNewMessage] = useState("");
  const chatRef = useRef(null); // Reference for the chat box

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { text: newMessage, sender: "You" }]);
      setNewMessage("");
    }
  };

  // Handle clicks outside of chat widget
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false); // Close chat if clicked outside
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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

      {/* Chat Box (Expands when opened) */}
      {isOpen && (
        <div ref={chatRef} className="w-80 bg-slate-800 text-white border border-gray-700 p-4 rounded-2xl shadow-lg animate-fadein">
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

          {/* Messages Container */}
          <div className="h-60 overflow-y-auto bg-slate-700 p-3 rounded-xl mb-3">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded-xl ${
                    msg.sender === "You"
                      ? "bg-blue-500 ml-auto w-fit"
                      : "bg-gray-600"
                  }`}
                >
                  <strong>{msg.sender}:</strong> {msg.text}
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
              className="bg-slate-700 text-white placeholder-gray-400 p-3 rounded-xl w-full border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl"
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
