"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

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
    <main className="dashboard">
      <aside className="sidebar">
        <strong>CORREOS DE GMAIL</strong>

        <span>{email}</span>

        <a href="/dashboard">Dashboard</a>
        <a href="/settings">Configuración</a>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">SISTEMA PRIVADO</p>
            <h1>Dashboard</h1>
            <p>Bienvenido a tu espacio personal.</p>
          </div>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", {
                method: "POST"
              });

              window.location.href = "/login";
            }}
          >
            Cerrar sesión
          </button>
        </header>

        <div className="grid">
          <article className="card">
            <h2>Cuenta</h2>
            <p>{email}</p>
          </article>

          <article className="card">
            <h2>Estado</h2>
            <p>Sesión activa</p>
          </article>
        </div>
      </section>
    </main>
  );
            }
