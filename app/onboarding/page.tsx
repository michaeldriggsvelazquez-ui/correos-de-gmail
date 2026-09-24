"use client";

import { useState } from "react";

export default function OnboardingPage() {
  const [message, setMessage] = useState("");

  return (
    <main className="auth-page">
      <div className="auth-box">
        <p className="eyebrow">CORREOS DE GMAIL</p>

        <h1>Configura tu cuenta</h1>

        <p>
          Escribe cómo quieres organizar tu experiencia dentro del sistema.
        </p>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();

            if (!message.trim()) {
              return;
            }

            window.location.href = "/dashboard";
          }}
        >
          <label htmlFor="message">Información inicial</label>

          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escribe aquí..."
            rows={6}
          />

          <button className="primary" type="submit">
            Continuar
          </button>
        </form>
      </div>
    </main>
  );
                }
