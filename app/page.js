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

  // Dosya yükleme
  const onDrop = useCallback(async (acceptedFiles) => {
    setLoading(true);
    setStatus("📤 Yükleniyor...");
    setErrorMsg("");

    for (const file of acceptedFiles) {
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
          .upload(`photos/${fileName}`, compressed, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;
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
        maxWidth: "900px",
        margin: "0 auto",
        color: "#fff",
        background: "#111",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#f2c14e" }}>
        💍 Düğün Fotoğraf Yükleme
      </h1>

      {/* Yükleme alanı */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #f2c14e",
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragActive ? "#333" : "#222",
          transition: "0.2s",
          marginBottom: "1.5rem",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p style={{ fontSize: "1.2rem" }}>Bırak yükleyelim 📸</p>
        ) : (
          <p style={{ fontSize: "1.1rem" }}>
            Fotoğrafları buraya sürükle <br /> veya <b>tıkla</b> seç
          </p>
        )}
      </div>

      {/* Durum mesajları */}
      {loading && <p style={{ color: "skyblue" }}>{status}</p>}
      {!loading && status && <p style={{ color: "lightgreen" }}>{status}</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}
