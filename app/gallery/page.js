"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PASSWORD = "burakcelik"; // sabit şifre

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
        limit: pageSize + 1,
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
    const handleLogin = () => {
      if (inputPassword === PASSWORD) {
        setAuthenticated(true);
      } else {
        alert("❌ Hatalı şifre!");
      }
    };

    return (
      <div
        style={{
          background: "linear-gradient(135deg,#111,#222)",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "#1c1c1c",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
            textAlign: "center",
            width: "100%",
            maxWidth: "400px",
            color: "#fff",
          }}
        >
          <h1 style={{ color: "#f2c14e", marginBottom: "1.5rem" }}>
            🔒 Galeri Girişi
          </h1>
          <input
            type="text"
            placeholder="Şifreyi girin"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            style={{
              padding: "0.8rem",
              borderRadius: "8px",
              border: "none",
              width: "100%",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              background: "#f2c14e",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
            }}
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  // 📷 Galeri ekranı
  return (
    <div
      style={{
        padding: "2rem",
        background: "linear-gradient(135deg,#111,#222)",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1
        style={{
          color: "#f2c14e",
          marginBottom: "2rem",
          textAlign: "center",
          fontSize: "2rem",
        }}
      >
        📷 Düğün Galerisi
      </h1>

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
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              transition: "transform 0.3s ease",
            }}
          >
            <img
              src={url}
              alt="Wedding"
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        ))}
      </div>

      {/* Sayfalama */}
      <div
        style={{
          marginTop: "2.5rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          style={{
            padding: "0.7rem 1.2rem",
            borderRadius: "50px",
            border: "none",
            background: page === 0 ? "#444" : "#f2c14e",
            cursor: page === 0 ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          ⬅ Önceki
        </button>
        <button
          disabled={!hasMore}
          onClick={() => setPage(page + 1)}
          style={{
            padding: "0.7rem 1.2rem",
            borderRadius: "50px",
            border: "none",
            background: hasMore ? "#f2c14e" : "#444",
            cursor: hasMore ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
        >
          Sonraki ➡
        </button>
      </div>
    </div>
  );
}
