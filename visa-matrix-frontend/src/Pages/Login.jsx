import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const redirectPath = location.state?.from?.pathname ?? "/applications";

  // Redirect if already logged in
  if (!loading && currentUser) {
    return <Navigate replace to={redirectPath} />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          error.message ??
          "Unable to sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md">
        <Link className="block text-center" to="/">
          <img src="/logo.png" alt="Visa Matrix" className="h-24 w-24 object-cover object-left mx-auto mb-6" />
        </Link>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-md">
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "24px", marginBottom: "12px" }}>
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
                Sign In
              </button>
              <Link
                to="/signup"
                onClick={() => navigate("/signup")}
                style={{
                  textDecoration: "none",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  color: "#6b7280",
                }}
              >
                Sign Up
              </Link>
            </div>
            <div
              style={{
                width: "96px",
                height: "3px",
                borderRadius: "999px",
                background: "#7c3aed",
                marginBottom: "20px",
              }}
            />
            <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>
              Let&apos;s get started by filling out the form below.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {errorMessage ? (
              <div className="alert-card alert-card--danger" style={{ marginBottom: "14px" }}>
                <strong>{errorMessage}</strong>
              </div>
            ) : null}

            <div style={{ marginBottom: "14px" }}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
              />
            </div>

            <div style={{ textAlign: "right", marginBottom: "18px" }}>
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#6b7280",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Forgot Password
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              style={{ border: "none", fontSize: "1rem", fontWeight: 700, cursor: isSubmitting ? "progress" : "pointer" }}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
