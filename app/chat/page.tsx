'use client'

import React, { useEffect, useState } from "react";
import styles from "../../styles/ChatInterface.module.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faRemove } from "@fortawesome/free-solid-svg-icons";

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const code = localStorage.getItem("code");
    if (!code) {
      window.location.replace("/"); // Redirect to /
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message && !image) {
      alert("Please enter a message or upload an image.");
      return;
    }

    const code = localStorage.getItem("code");

    if (!code) {
      window.location.replace("/");
      return;
    }

    try {
      const formData = new FormData();
      if (message) formData.append("text", message);
      if (image) formData.append("media", image);
      formData.append("code", code);

      const VERI_BASEURL = process.env.NEXT_PUBLIC_VERI_BASEURL;
      setLoading(true);
      await axios.post(`${VERI_BASEURL}/overly/message`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLoading(false);
      setMessage("");
      setImage(null);
      setPreviewUrl(null);
    } catch (error) {
      setLoading(false);
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

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          setImage(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleLogout = () => {
    // Clear the stored authentication token or any user data
    localStorage.removeItem("code"); // remove the OTP code
    // If you store other user data, you can clear them too
    // localStorage.clear(); // optionally clear all localStorage

    // Redirect user to login page
    window.location.replace("/register");
  };


  return (
    <div
      className={styles.container}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Chat Header */}
      <div className={styles.header}>
        <h2 className={styles.chatTitle}>Chat</h2>
        <button
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className={styles.chatWindow}></div>

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
              <FontAwesomeIcon icon={faRemove} size="lg" />
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
            <FontAwesomeIcon icon={faCamera} size="lg" />
          </label>
          {loading ? (
            "Sending..."
          ) : (
            <button onClick={handleSendMessage} className={styles.sendButton}>
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
