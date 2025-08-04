import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";

const ChatWindow = ({
  messages,
  onSend,
  username,
  activeUsers,
  sidebarOpen,
  toggleSidebar,
  onLogout
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  useEffect(() => {
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages]);

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '';

  return (
    <div className={`main-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* Left Sidebar */}
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>👥 Online ({activeUsers.length})</h3>
            <button className="close-sidebar" onClick={toggleSidebar}>×</button>
          </div>
          <ul className="user-list">
            {activeUsers.map((user) => (
              <li key={user} className={user === username ? "current-user" : ""}>
                <span className="user-avatar">{getInitial(user)}</span>
                <span className="user-name">
                  {user} {user === username && "(You)"}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="chat-container">
        <div className="chat-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <h2>💬 Team Chat</h2>
          <span className="username-label">{username}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg) => {
            const isOwn = msg.sender === username;

            if (msg.type === "JOIN") {
              return (
                <div key={`join-${msg.id}`} className="system-message">
                  {msg.sender} joined the chat.
                </div>
              );
            }

            if (msg.type === "LEAVE") {
              return (
                <div key={`leave-${msg.id}`} className="system-message leave">
                  {msg.sender} left the chat.
                </div>
              );
            }

            return (
              <div
                key={`msg-${msg.id}`}
                className={`message-row ${isOwn ? "own" : "other"}`}
              >
                {!isOwn && <div className="avatar">{getInitial(msg.sender)}</div>}

                <div className={`message-bubble ${isOwn ? "own-bubble" : "other-bubble"}`}>
                  {!isOwn && <div className="sender-name">{msg.sender}</div>}
                  <div className="message-text">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>


    </div>
  );
};

export default ChatWindow;