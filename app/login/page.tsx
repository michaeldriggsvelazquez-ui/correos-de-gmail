import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-box">
        <p className="eyebrow">CORREOS DE GMAIL</p>

        <h1>Entrar</h1>

        <LoginForm />

        <p>
          <a href="/signup">Crear una cuenta</a>
        </p>
      </div>
    </main>
  );
}
