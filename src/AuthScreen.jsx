import React, { useState } from "react"; import { Eye, EyeOff } from "lucide-react"; import { supabase } from "./supabaseClient";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setConfirmMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onAuthenticated(data.session);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          onAuthenticated(data.session);
        } else {
          setConfirmMessage(
            "Регистрация прошла успешно. Проверьте почту и подтвердите email, затем войдите."
          );
          setMode("login");
        }
      }
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  function translateAuthError(err) {
    const message =
      (err && typeof err === "object" && err.message) ||
      (typeof err === "string" ? err : "") ||
      "Произошла неизвестная ошибка. Попробуйте ещё раз.";

    if (message.includes("Invalid login credentials")) {
      return "Неверный email или пароль";
    }
    if (message.includes("User already registered")) {
      return "Этот email уже зарегистрирован — попробуйте войти";
    }
    if (message.includes("Password should be at least")) {
      return "Пароль слишком короткий — минимум 6 символов";
    }
    if (message.includes("Email not confirmed")) {
      return "Email не подтверждён — проверьте почту и перейдите по ссылке из письма";
    }
    return message;
  }

  return (
    <div
      className="min-h-screen w-full font-sans flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#f6f1e8", color: "#2a2520", colorScheme: "light" }}
    >
      <div className="w-full max-w-sm">
        <h1 className="text-[28px] leading-tight mb-1" style={{ fontFamily: "'Georgia', serif" }}>
          Мой гардероб
        </h1>
        <p className="text-sm mb-7" style={{ color: "#8a7d6a" }}>
          {mode === "login" ? "Войдите в свой аккаунт" : "Создайте аккаунт"}
        </p>

        {confirmMessage && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: "#dce8d4", color: "#3a4f2f" }}
          >
            {confirmMessage}
          </div>
        )}

        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: "#f0e6d4", color: "#6b5a3f" }}
          >
            {typeof error === "string" ? error : "Произошла ошибка. Попробуйте ещё раз."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: "#8a7d6a" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border text-sm outline-none"
              style={{ backgroundColor: "#ffffff", borderColor: "#e3d8c4", color: "#2a2520" }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: "#8a7d6a" }}>
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 pl-4 pr-11 rounded-xl border text-sm outline-none"
                style={{ backgroundColor: "#ffffff", borderColor: "#e3d8c4", color: "#2a2520" }}
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#8a7d6a" }}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-sm font-medium mt-2"
            style={{
              backgroundColor: loading ? "#e3d8c4" : "#e0563a",
              color: loading ? "#a89a82" : "#ffffff",
            }}
          >
            {loading ? "Подождите..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setConfirmMessage(null);
          }}
          className="w-full text-center text-sm mt-5"
          style={{ color: "#8a7d6a" }}
        >
          {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}
