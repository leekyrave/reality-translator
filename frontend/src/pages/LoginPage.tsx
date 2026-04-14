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
      navigate("/dashboard");
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

            {/* Divider */}
            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">OR CONTINUE WITH</span>
              <div className="divider-line" />
            </div>

            {/* Social buttons */}
            <div className="social-row">
              <button className="btn-social">
                {/* Google icon */}
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="btn-social">
                {/* Microsoft icon */}
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
                  <rect x="13" y="1" width="10" height="10" fill="#7fba00"/>
                  <rect x="1" y="13" width="10" height="10" fill="#00a4ef"/>
                  <rect x="13" y="13" width="10" height="10" fill="#ffb900"/>
                </svg>
                Microsoft
              </button>
            </div>

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