"use client";

import React, { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function WeddingUpload() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);

  // Dosya yükleme
  const onDrop = useCallback(async (acceptedFiles) => {
    setLoading(true);
    setStatus("📤 Fotoğraflar yükleniyor...");
    setErrorMsg("");
    setProgress(0);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      try {
        const compressed = await imageCompression(file, {
          maxWidthOrHeight: 1600,
          maxSizeMB: 1,
          useWebWorker: true,
        });

        const ext = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${ext}`;

        const { error } = await supabase.storage
          .from("photos")
          .upload(fileName, compressed, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;
        setProgress(((i + 1) / acceptedFiles.length) * 100);
      } catch (err) {
        console.error(err);
        setErrorMsg("❌ Yükleme sırasında hata oluştu.");
      }
    }

    setLoading(false);
    if (!errorMsg) setStatus("✅ Yükleme tamamlandı!");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111, #222)",
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "#1c1c1c",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "1.5rem", color: "#f2c14e" }}>
          💍 Düğün Fotoğraf Yükleme
        </h1>

        {/* Yükleme alanı */}
        <div
          {...getRootProps()}
          style={{
            border: "2px dashed #f2c14e",
            borderRadius: "12px",
            padding: "3rem",
            cursor: "pointer",
            backgroundColor: isDragActive ? "#333" : "#222",
            transition: "0.3s",
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p style={{ fontSize: "1.2rem", color: "#f2c14e" }}>
              Bırak yükleyelim 📸
            </p>
          ) : (
            <p style={{ fontSize: "1.1rem", lineHeight: "1.5rem" }}>
              Fotoğrafları buraya sürükle <br /> veya{" "}
              <b style={{ color: "#f2c14e" }}>tıkla</b> seç
            </p>
          )}
        </div>

        {/* Progress bar */}
        {loading && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ color: "skyblue" }}>{status}</p>
            <div
              style={{
                background: "#444",
                borderRadius: "6px",
                overflow: "hidden",
                marginTop: "0.5rem",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "8px",
                  background: "#f2c14e",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Mesajlar */}
        {!loading && status && (
          <p style={{ marginTop: "1rem", color: "lightgreen" }}>{status}</p>
        )}
        {errorMsg && (
          <p style={{ marginTop: "1rem", color: "red" }}>{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
