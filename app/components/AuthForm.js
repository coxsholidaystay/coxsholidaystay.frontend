"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AuthForm({ mode }) {
  const [notice, setNotice] = useState("");
  const [noticeIsError, setNoticeIsError] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  useEffect(() => {
    let active = true;
    fetch(`${apiBase}/api/auth/me`, { credentials: "include" })
      .then(async (response) => {
        if (response.status === 401) return null;
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not check your account.");
        return data.user;
      })
      .then((user) => {
        if (active && user) setCurrentUser(user);
      })
      .catch(() => {
        if (active) {
          setNotice("Account service is unavailable. You can still browse the frontend preview.");
          setNoticeIsError(true);
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isRegister && password !== confirmPassword) {
      setNotice("Your passwords do not match. Please check both fields.");
      setNoticeIsError(true);
      return;
    }

    setSubmitting(true);
    setNotice("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get("email"),
      password
    };
    if (isRegister) payload.name = formData.get("name");

    try {
      const response = await fetch(`${apiBase}/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error || "We couldn't complete your request. Please try again.");
        setNoticeIsError(true);
        return;
      }

      setCurrentUser(data.user);
      setNotice(`You're signed in as ${data.user.name}.`);
      setNoticeIsError(false);
    } catch {
      setNotice("Account service is unavailable. Please try again once the server is running.");
      setNoticeIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    try {
      const response = await fetch(`${apiBase}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error || "We couldn't sign you out. Please try again.");
        setNoticeIsError(true);
        return;
      }
      setCurrentUser(null);
      setPassword("");
      setConfirmPassword("");
      setNotice("You have been signed out.");
      setNoticeIsError(false);
    } catch {
      setNotice("Account service is unavailable. Please try again once the server is running.");
      setNoticeIsError(true);
    }
  }

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) }
  ];

  return (
    <section className="auth-card">
      <Link className="auth-back-link" href="/">← Back to exploring</Link>
      <p className="eyebrow">{isRegister ? "A LITTLE MORE PERSONAL" : "WELCOME BACK"}</p>
      <h1>{isRegister ? "Make yourself at home." : "Good to see you again."}</h1>
      <p className="auth-intro">
        {isRegister
          ? "Create an account to keep your favorite stays and trip ideas close."
          : "Sign in to pick up where your next escape left off."}
      </p>
      {authLoading ? (
        <p className="auth-loading" role="status">Checking your account…</p>
      ) : currentUser ? (
        <div className="auth-account">
          <div className="auth-account-mark" aria-hidden="true">{currentUser.name.charAt(0).toUpperCase()}</div>
          <p className="eyebrow">YOU&apos;RE ALL SET</p>
          <h2>Welcome, {currentUser.name.split(" ")[0]}.</h2>
          <p>{currentUser.email}</p>
          {notice && <p className={`auth-notice${noticeIsError ? " auth-notice-error" : ""}`} role="status">{notice}</p>}
          <button className="google-auth-button" type="button" onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <>
          <button
            className="google-auth-button"
            type="button"
            onClick={() => {
              setNotice("Google sign-in is not configured yet. Add OAuth credentials when you are ready to enable it.");
              setNoticeIsError(true);
            }}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
              <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
              <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
              <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9A19.7 19.7 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
            </svg>
            Continue with Google
          </button>
          <div className="auth-divider"><span>or continue with email</span></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label>
                Full name
                <input name="name" type="text" autoComplete="name" placeholder="Your name" minLength={2} maxLength={80} required />
              </label>
            )}
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required />
            </label>
            <label>
              Password
              <span className="password-input-wrap">
                <input
                  name="password"
                  aria-label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder={isRegister ? "Create a secure password" : "Enter your password"}
                  minLength={8}
                  maxLength={128}
                  pattern={isRegister ? "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}" : undefined}
                  title={isRegister ? "Use at least 8 characters, including uppercase, lowercase, and a number." : undefined}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setNotice("");
                    setNoticeIsError(false);
                  }}
                  aria-describedby={isRegister ? "password-requirements" : undefined}
                  required
                />
                <button
                  className="password-visibility"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >{showPassword ? "Hide" : "Show"}</button>
              </span>
            </label>
            {isRegister && (
              <>
                <ul className="password-requirements" id="password-requirements" aria-label="Password requirements">
                  {passwordChecks.map((check) => (
                    <li className={check.valid ? "is-valid" : ""} key={check.label}>
                      <span aria-hidden="true">{check.valid ? "✓" : "·"}</span>{check.label}
                    </li>
                  ))}
                </ul>
                <label>
                  Confirm password
                  <span className="password-input-wrap">
                    <input
                      name="confirmPassword"
                      aria-label="Confirm password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter your password again"
                      minLength={8}
                      maxLength={128}
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setNotice("");
                        setNoticeIsError(false);
                      }}
                      required
                    />
                    <button
                      className="password-visibility"
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                    >{showConfirmPassword ? "Hide" : "Show"}</button>
                  </span>
                </label>
              </>
            )}
            {!isRegister && (
              <button
                className="forgot-password"
                type="button"
                onClick={() => {
                  setNotice("Password reset requires an email service, which is not configured yet.");
                  setNoticeIsError(true);
                }}
              >
                Forgot password?
              </button>
            )}
            {isRegister && (
              <label className="auth-checkbox">
                <input type="checkbox" />
                <span>Send me thoughtful travel updates.</span>
              </label>
            )}
            {notice && <p className={`auth-notice${noticeIsError ? " auth-notice-error" : ""}`} role="status">{notice}</p>}
            <button className="search-button auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Please wait..." : isRegister ? "Create my account" : "Sign in"}
              {!submitting && <span aria-hidden="true">↗</span>}
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to Cox’s?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </>
      )}
      <p className="auth-privacy">Your details stay yours. We never share your personal information.</p>
    </section>
  );
}
