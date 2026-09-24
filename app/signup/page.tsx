import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="auth-page">
      <div className="auth-box">
        <p className="eyebrow">CORREOS DE GMAIL</p>

        <h1>Crear cuenta</h1>

        <SignupForm />

        <p>
          <a href="/login">Ya tengo una cuenta</a>
        </p>
      </div>
    </main>
  );
}
