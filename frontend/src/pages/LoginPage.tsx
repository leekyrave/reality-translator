import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/auth.css';

const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await login({ email: form.email, password: form.password });
      navigate("/workspace");
    } catch {
      // error is already handled in context
    }
  };

  return (
    <>
      <div className="login-root">
        <div className="login-main">

          {/* ── Left panel ── */}
          <div className="login-left">
            <h1 className="left-headline">Architecting<br />Intelligence.</h1>
            <p className="left-sub">
              Enter a curated environment where structural clarity meets
              advanced curation. Manage your architectural intelligence
              with The Lucid Curator.
            </p>
            <div className="left-cards">
              <div className="left-card" />
              <div className="left-card wide" />
              <div className="left-card row2-wide">
                <div className="inner" />
                <div className="inner" />
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="login-right">

            {/* Brand */}
            <div className="brand-row">
              <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2" />
                <line x1="12" y1="7" x2="8" y2="19" />
                <line x1="12" y1="7" x2="16" y2="19" />
                <line x1="7" y1="14" x2="17" y2="14" />
              </svg>
              <span className="brand-name">The Lucid Curator</span>
            </div>

            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Please enter your credentials to access your workspace.</p>

            {error && <div className="error-box">{error}</div>}

            {/* Email */}
            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label">Email Address</label>
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="field-input"
              />
            </div>

            {/* Password */}
            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label">Password</label>
                <a href="#" className="forgot-link">Forgot Password?</a>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="field-input"
              />
            </div>

            <button onClick={handleSubmit} disabled={isLoading} className="btn-primary">
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            <div className="signup-row">
              Don't have an account?
              <Link to="/register">Sign Up</Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="login-footer">
          <span className="footer-copy">© 2024 The Lucid Curator. Architectural Intelligence.</span>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
            <a href="#">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LoginPage;