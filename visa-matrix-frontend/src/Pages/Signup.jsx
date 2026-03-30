import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { signUpUser } from "../services/authService";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signUpUser({ email, password });
      alert("Signup successful. Please check your email for confirmation.");
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md">
        <Link className="block text-center" to="/">
          <Logo variant="auth" />
        </Link>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-md">
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "24px", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#111827",
                  cursor: "pointer",
                }}
              >
                Sign Up
              </button>
            </div>
            <div
              style={{
                width: "96px",
                height: "3px",
                borderRadius: "999px",
                background: "#7c3aed",
                marginLeft: "92px",
                marginBottom: "20px",
              }}
            />
            <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>
              Let&apos;s get started by filling out the form below.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
              />
            </div>

            {errorMessage ? (
              <p
                style={{
                  color: "#b42318",
                  margin: "0 0 14px",
                  fontSize: "0.95rem",
                }}
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              style={{ border: "none", fontSize: "1rem", fontWeight: 700, cursor: isSubmitting ? "progress" : "pointer" }}
            >
              {isSubmitting ? "Signing up..." : "Create Account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
