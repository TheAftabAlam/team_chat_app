import React, { useState } from "react";
import "./LoginForm.css";

const LoginForm = ({ onConnect }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onConnect(name);
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <form onSubmit={handleSubmit} className="login-form">
          <h1 className="login-title">💬 Team Chat</h1>
          <p className="login-subtitle">Enter your real name to join the chat.</p>
          <p className="login-note">📝 Andi Bandi Sandi Jo Apna real name na dale ... 😄</p>
          <input
            type="text"
            className="login-input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="login-button">
            🚀 Connect Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
