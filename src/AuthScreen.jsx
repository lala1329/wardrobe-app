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
      console.error("Auth error (raw):", err);
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  function translateAuthError(err) {
    let message = "";
    try {
      if (err && typeof err === "object") {
        message =
          err.message ||
          err.error_description ||
          err.error ||
          err.msg ||
          (err.toString && err.toString() !== "[object Object]" ? err.toString() : "") ||
          JSON.stringify(err);
      } else if (typeof err === "string") {
        message = err;
      }
    } catch (e) {
      message = "";
    }

    if (!message || message === "{}") {
      message = "Не удалось выполнить запрос. Проверьте подключение к интернету и попробуйте снова.";
    }

    if (message.includes("Invalid login credentials")) {
      return "Неверный email или пароль";
    }
    if (message.includes("User already registered")) {
      return "Этот email уже зарегистрирован — попробуйте
