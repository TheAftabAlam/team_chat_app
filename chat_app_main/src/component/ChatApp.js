import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import ChatWindow from "./ChatWindow";
import LoginForm from "./LoginForm";
import "./ChatApp.css";

const ChatApp = () => {
  const [username, setUsername] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const stompClient = useRef(null);

  const BASE_URL = "http://192.168.0.110:8080/websocket";

  useEffect(() => {
    const savedName = localStorage.getItem("chat_username");
    if (savedName) connect(savedName);

    return () => {
      if (stompClient.current && connected) {
        stompClient.current.publish({
          destination: "/app/chat.register",
          body: JSON.stringify({ sender: username, type: "LEAVE" }),
        });
        stompClient.current.deactivate();
      }
    };
  }, []);

  const showNotification = async (message) => {
    // Don't show notification if:
    // - No message
    // - Message is from current user
    // - Window is currently focused
    if (!message || message.sender === username || document.hasFocus()) return;

    // Check if notifications are permitted
    if (Notification.permission === "granted") {
      const notification = new Notification(`💬 ${message.sender}`, {
        body: message.content || "New message",
        requireInteraction: false,
        tag: `message-${message.id || Date.now()}`,  // Unique tag to prevent duplicates
        icon: '/path/to/notification-icon.png'  // Optional: add your icon
      });

      // Focus the chat when notification is clicked
      notification.onclick = () => {
        window.focus();
        // Optional: scroll to the specific message
      };
    }else{
      if (Notification.permission !== "granted") {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
    }
  };
  const handleLogout = () => {
  if (stompClient.current && connected) {
    // Notify other users about logout
    stompClient.current.publish({
      destination: "/app/chat.register",
      body: JSON.stringify({ sender: username, type: "LEAVE" }),
    });

    // Disconnect from WebSocket
    stompClient.current.deactivate();
  }

  // Clear local state
  setConnected(false);
  setUsername(null);
  setMessages([]);
  setActiveUsers([]);
  localStorage.removeItem("chat_username");
};


  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const connect = async (name) => {
    try {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }

      const socket = new SockJS(BASE_URL);
      stompClient.current = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          setConnected(true);
          setUsername(name);
          localStorage.setItem("chat_username", name);
          setError(null);
          setMessages([]);
          setActiveUsers([]);

          stompClient.current.subscribe("/topic/public", (msg) => {
            const message = JSON.parse(msg.body);

            setMessages((prev) => {
              // if (prev.some(m => m.id === message.id)) return prev;
              return [...prev, message];
            });

            if (message.type === "CHAT") {
              showNotification(message);
            }

            if (message.type === "JOIN") {
              setActiveUsers(prev => [...new Set([...prev, message.sender])]);
            } else if (message.type === "LEAVE") {
              setActiveUsers(prev => prev.filter(user => user !== message.sender));
            }
          });

          stompClient.current.publish({
            destination: "/app/chat.register",
            body: JSON.stringify({ sender: name, type: "JOIN" }),
          });
        },
        onStompError: (error) => {
          console.error("STOMP error:", error);
          setError("⚠️ Connection error. Trying to reconnect...");
        }
      });

      stompClient.current.activate();
    } catch (err) {
      console.error("Connection error:", err);
      setError("❌ Could not connect to server. Please try again.");
    }
  };

  const sendMessage = (content) => {
    if (content.trim() && stompClient.current) {
      const message = {
        sender: username,
        content,
        type: "CHAT",
        timestamp: new Date().toISOString(),
        id: Date.now()
      };

      stompClient.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(message),
      });
    }
  };

  return (
    <div className="chat-app">
      {error && (
        <div className="error-popup">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      {connected && username ? (
        <ChatWindow
          messages={messages}
          onSend={sendMessage}
          username={username}
          activeUsers={activeUsers}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />
      ) : (
        <LoginForm onConnect={connect} />
      )}
    </div>
  );
};

export default ChatApp;