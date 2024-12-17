'use client'

import React, { useEffect, useState } from "react";
import styles from "../../styles/ChatInterface.module.css"; // CSS module for styling
import axios from "axios";

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  //const [chatHistory, setChatHistory] = useState<{ text?: string; image?: string }[]>([]);

  useEffect(() => {

    const code = localStorage.getItem("code");
    if (!code) {
       window.location.replace("/register"); // Redirect to /register
    }
}, []);
const handleSendMessage = async () => {

  
    if (!message && !image) {
      alert("Please enter a message or upload an image.");
      return;
    }
  
    const code = localStorage.getItem("code"); // Get the code (encrypted phone number) from localStorage
  
    // If no code, redirect to /register
    if (!code) {
      window.location.replace("/register"); 
      return; // Prevent further execution if no code is found
    }
  
    try {
      const formData = new FormData();
      if (message) formData.append("text", message); // Append the message
      if (image) formData.append("media", image); // Append the image file
  
      // Append the code (encrypted phone number) to the formData
      formData.append("code", code);
  
      // Send request to backend
      const VERI_BASEURL = process.env.NEXT_PUBLIC_VERI_BASEURL
     setLoading(true)
      await axios.post(`${VERI_BASEURL}/overly/message`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Clear the form fields after sending the message
      setLoading(false)
      setMessage("");
      setImage(null);
      setPreviewUrl(null); // Reset preview if any
  
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
          {loading?
          'sending...':
          (<button onClick={handleSendMessage} className={styles.sendButton}>
            Send
          </button>)}

        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
