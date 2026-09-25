"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Message = {
  id: string;
  role: "system" | "user";
  text: string;
};

type RequestResponse = {
  success?: boolean;
  error?: string;
  request?: {
    id: string;
    email: string;
    status: string;
    createdAt: number;
  };
  message?: string;
};

const initialMessage: Message = {
  id: "welcome",
  role: "system",
  text:
    "Para comenzar con la venta envía tu cuenta Gmail.\n\n" +
    "Ejemplo: micuenta@gmail.com\n\n" +
    "Si no sabes cómo crear una cuenta, puedes consultar el tutorial desde el menú."
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    initialMessage
  ]);

  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [sending, setSending] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  function addMessage(role: Message["role"], text: string) {
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        text
      }
    ]);
  }

  function handleStart() {
    if (started) {
      return;
    }

    setStarted(true);

    addMessage(
      "system",
      "Perfecto. Envíame ahora el correo de la cuenta interna que quieres enviar a revisión."
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = input.trim();

    if (!value || sending) {
      return;
    }

    setInput("");

    addMessage("user", value);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      addMessage(
        "system",
        "El correo no tiene un formato válido.\n\nEjemplo: micuenta@gmail.com"
      );

      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: value
        })
      });

      const data: RequestResponse = await response.json();

      if (!response.ok || !data.success) {
        addMessage(
          "system",
          data.error ?? "No se pudo enviar la solicitud."
        );

        return;
      }

      if (data.request?.id) {
        setRequestId(data.request.id);
      }

      addMessage(
        "system",
        data.message ??
          "Tu solicitud fue enviada correctamente y está pendiente de revisión."
      );

      addMessage(
        "system",
        "Cuando un administrador revise la solicitud, su estado podrá aparecer como aprobada o rechazada."
      );
    } catch {
      addMessage(
        "system",
        "No se pudo conectar con el sistema. Comprueba la conexión e inténtalo nuevamente."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="chat-container">
      <header className="chat-header">
        <div>
          <p className="eyebrow">CORREOS DE GMAIL</p>

          <h1>Chat</h1>

          <p className="chat-status">
            Sistema privado
          </p>
        </div>

        <div className="chat-header-actions">
          <Link href="/balance">
            💰
          </Link>

          <Link href="/tutorial">
            ❓
          </Link>
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.role === "user"
                ? "chat-message-user"
                : "chat-message-system"
            }`}
          >
            <div className="chat-message-bubble">
              {message.text}
            </div>
          </div>
        ))}

        {sending && (
          <div className="chat-message chat-message-system">
            <div className="chat-message-bubble">
              Enviando solicitud...
            </div>
          </div>
        )}
      </div>

      <div className="chat-bottom">
        {!started ? (
          <button
            type="button"
            className="chat-start-button"
            onClick={handleStart}
          >
            INICIAR
          </button>
        ) : (
          <form
            className="chat-form"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Escribe el correo..."
              autoComplete="off"
              disabled={sending}
            />

            <button
              type="submit"
              disabled={sending || !input.trim()}
            >
              {sending ? "..." : "➤"}
            </button>
          </form>
        )}

        <nav className="chat-navigation">
          <Link href="/dashboard">
            MENÚ
          </Link>

          <Link href="/history">
            HISTORIAL
          </Link>

          <Link href="/settings">
            CONFIGURACIÓN
          </Link>
        </nav>

        {requestId && (
          <p className="chat-request-id">
            Solicitud: {requestId}
          </p>
        )}
      </div>
    </section>
  );
  }
