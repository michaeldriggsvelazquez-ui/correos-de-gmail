"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        setEmail(data.user?.email ?? "");
        setLoading(false);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  if (loading) {
    return <main className="loading">Cargando...</main>;
  }

  return (
    <main className="auth-page">
      <div className="auth-box">
        <p className="eyebrow">CORREOS DE GMAIL</p>

        <h1>Configuración</h1>

        <div className="card">
          <h2>Cuenta</h2>

          <p>{email}</p>
        </div>

        <p>
          <a href="/dashboard">← Volver al dashboard</a>
        </p>
      </div>
    </main>
  );
          }
