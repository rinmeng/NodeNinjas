// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:15000'); // Backend URL

// const Chat = ({ sessionUser }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [recipient, setRecipient] = useState(''); // Recipient ID
//   const [onlineUsers, setOnlineUsers] = useState([]); // Online users list
//   const chatRef = useRef(null);

//   // Fetch message history when a recipient is selected
//   useEffect(() => {
//     if (recipient) {
//       fetchMessageHistory(sessionUser.id, recipient);
//     }
//   }, [recipient]);

//   // Connect to Socket.IO and handle real-time updates
//   useEffect(() => {
//     if (sessionUser) {
//       socket.emit('join', sessionUser.id); // Send user ID to backend
//     }

//     // Listen for online users updates
//     socket.on('updateUsers', (users) => {
//       console.log('Online users:', users);
//       setOnlineUsers(users);
//     });

//     // Listen for new messages
//     socket.on('receiveMessage', (messageData) => {
//       console.log('New message received:', messageData);
//       setMessages((prev) => [...prev, messageData]);
//     });

//     // Cleanup on unmount
//     return () => {
//       socket.off('updateUsers');
//       socket.off('receiveMessage');
//       socket.disconnect();
//     };
//   }, [sessionUser]);

//   // Scroll to the bottom of the chat when messages update
//   useEffect(() => {
//     chatRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Fetch message history from the backend
//   const fetchMessageHistory = async (userId1, userId2) => {
//     try {
//       const response = await fetch(
//         `http://localhost:15000/message/history/${userId1}/${userId2}`
//       );
//       const data = await response.json();
//       setMessages(data); // Update the messages state
//     } catch (err) {
//       console.error('Error fetching message history:', err);
//     }
//   };

//   // Send a new message
//   const sendMessage = () => {
//     if (newMessage.trim() !== '' && recipient.trim() !== '') {
//       const messageData = {
//         sender: sessionUser.id, // Sender ID
//         recipient, // Recipient ID
//         text: newMessage, // Message content
//       };

//       console.log('Sending message:', messageData);
//       socket.emit('sendMessage', messageData); // Send message to backend
//       setNewMessage(''); // Clear input
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 text-black">
//       {/* Sidebar for Online Users */}
//       <div className="w-1/4 bg-gray-200 text-black p-4 border-r">
//         <h2 className="text-xl font-semibold mb-4">Online Users</h2>
//         {onlineUsers.map((userId, index) => (
//           <div
//             key={index}
//             onClick={() => setRecipient(userId)}
//             className={`p-3 mb-2 rounded-lg cursor-pointer ${
//               recipient === userId ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
//             }`}
//           >
//             User {userId}
//           </div>
//         ))}
//       </div>

//       {/* Chat Panel */}
//       <div className="w-3/4 flex flex-col bg-white">
//         {/* Chat Header */}
//         <div className="bg-blue-500 text-white p-4 text-lg font-semibold">
//           {recipient ? `Chat with User ${recipient}` : 'Select a chat'}
//         </div>

//         {/* Messages Area */}
//         <div className="flex-1 p-4 overflow-y-auto space-y-2">
//           {messages
//             .filter(
//               (msg) =>
//                 (msg.sender_id === sessionUser.id && msg.recipient_id === recipient) ||
//                 (msg.sender_id === recipient && msg.recipient_id === sessionUser.id)
//             )
//             .map((msg, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   msg.sender_id === sessionUser.id ? 'justify-end' : 'justify-start'
//                 }`}
//               >
//                 <div
//                   className={`max-w-xs p-3 rounded-lg ${
//                     msg.sender_id === sessionUser.id
//                       ? 'bg-blue-500 text-white' // Sent messages
//                       : 'bg-gray-300 text-black' // Received messages
//                   }`}
//                 >
//                   <p className="text-sm">{msg.text}</p>
//                   <p className="text-xs text-gray-700 text-right mt-1">
//                     {new Date(msg.sent_at).toLocaleTimeString()} {/* Timestamp */}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           <div ref={chatRef}></div>
//         </div>

//         {/* Message Input */}
//         <div className="p-4 border-t bg-gray-100 flex">
//           <input
//             type="text"
//             className="flex-1 p-2 border rounded-lg text-black bg-white"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//             placeholder="Type a message..."
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;
