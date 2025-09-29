"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sabit şifre
const PASSWORD = "burakcelik";

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const fetchPhotos = async () => {
    const { data, error } = await supabase.storage
      .from("photos")
      .list("", {
        limit: pageSize + 1, // bir fazla al ki sonraki var mı anlaşılsın
        offset: page * pageSize,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Listeleme hatası:", error.message);
      return;
    }

    setHasMore(data.length > pageSize);

    const visibleData = data.slice(0, pageSize);
    const urls = visibleData.map((file) =>
      supabase.storage.from("photos").getPublicUrl(file.name).data.publicUrl
    );

    setPhotos(urls);
  };

  useEffect(() => {
    if (authenticated) {
      fetchPhotos();
    }
  }, [page, authenticated]);

  // 🔐 Şifre ekranı
  if (!authenticated) {
    return (
      <div
        style={{
          background: "#111",
          minHeight: "100vh",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ color: "#f2c14e", marginBottom: "1rem" }}>🔒 Galeri Girişi</h1>
        <input
          type="text"
          placeholder="Şifreyi girin"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          style={{
            padding: "0.7rem",
            borderRadius: "8px",
            border: "none",
            marginBottom: "1rem",
            width: "250px",
          }}
        />
        <button
          onClick={() => {
            if (inputPassword === PASSWORD) {
              setAuthenticated(true);
            } else {
              alert("❌ Hatalı şifre!");
            }
          }}
          style={{
            padding: "0.7rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            background: "#f2c14e",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  // 📷 Galeri ekranı
  return (
    <div
      style={{
        padding: "2rem",
        background: "#111",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1 style={{ color: "#f2c14e", marginBottom: "1rem" }}>📷 Galeri</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {photos.map((url, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              aspectRatio: "1/1", // kare görünüm
            }}
          >
            <img
              src={url}
              alt="Wedding"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // siyah boşluk bırakmaz
                display: "block",
              }}
            />
          </div>
        ))}
      </div>

      {/* Sayfalama */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            background: page === 0 ? "#444" : "#f2c14e",
            cursor: page === 0 ? "not-allowed" : "pointer",
          }}
        >
          ⬅ Önceki
        </button>
        <button
          disabled={!hasMore}
          onClick={() => setPage(page + 1)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            background: hasMore ? "#f2c14e" : "#444",
            cursor: hasMore ? "pointer" : "not-allowed",
          }}
        >
          Sonraki ➡
        </button>
      </div>
    </div>
  );
}
