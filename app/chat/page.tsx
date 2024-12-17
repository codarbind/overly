'use client'

import React, { useState } from "react";
import styles from "../../styles/ChatInterface.module.css"; // CSS module for styling
import axios from "axios";

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ text?: string; image?: string }[]>([]);

  const handleSendMessage = async () => {
    if (!message && !image) {
      alert("Please enter a message or upload an image.");
      return;
    }

    try {
      const formData = new FormData();
      if (message) formData.append("message", message);
      if (image) formData.append("image", image);

      // Backend endpoint call
      await axios.post("/api/chat/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    //   // Update chat history locally
    //   setChatHistory((prev) => [
    //     ...prev,
    //     { text: message, image: previewUrl },
    //   ]);
      setMessage("");
      setImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatWindow}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={styles.chatBubble}>
            {chat.text && <p>{chat.text}</p>}
            {chat.image && <img src={chat.image} alt="Uploaded preview" />}
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        {previewUrl && (
          <div className={styles.imagePreview}>
            <img src={previewUrl} alt="Preview" />
            <button
              className={styles.removeImageButton}
              onClick={() => {
                setImage(null);
                setPreviewUrl(null);
              }}
            >
              Remove
            </button>
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className={styles.textInput}
        />
        <div className={styles.actions}>
          <input
            type="file"
            accept="image/*"
            id="upload"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <label htmlFor="upload" className={styles.uploadButton}>
            📷
          </label>
          <button onClick={handleSendMessage} className={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
