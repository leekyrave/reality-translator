import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/auth.css';

const RegisterPage = () => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!agreed) {
      setValidationError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (form.password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }
    if (!/[a-z]/.test(form.password)) {
      setValidationError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setValidationError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setValidationError("Password must contain at least one number");
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(form.password)) {
      setValidationError("Password must contain at least one symbol");
      return;
    }

    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/workspace");
    } catch {
      // error is already handled in context
    }
  };

  const displayError = validationError || error;

  return (
    <>
      <div className="reg-root">
        <div className="reg-main">

          {/* ── Left panel ── */}
          <div className="reg-left">
            <div className="left-brand">The Lucid Curator</div>
            <h1 className="left-headline">Architectural<br />Intelligence.</h1>

            <div className="feature-card">
              <div className="feature-card-row">
                <svg className="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="2" />
                  <line x1="12" y1="7" x2="8" y2="19" />
                  <line x1="12" y1="7" x2="16" y2="19" />
                  <line x1="7" y1="14" x2="17" y2="14" />
                </svg>
                <p className="feature-text">
                  Turn complex jargon into <em>clear architectural insights</em>.
                </p>
              </div>
              <div className="feature-dots">
                <div className="dot" />
                <div className="dot dot-sm" />
                <div className="dot dot-active dot-sm" />
              </div>
            </div>

            <div className="social-proof-label">Used by leading global firms</div>
            <div className="firm-logos">
              <span className="firm-logo">Stratos</span>
              <span className="firm-logo">Blueprint</span>
              <span className="firm-logo">Nova</span>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="reg-right">
            <h2 className="form-title">Create your workspace</h2>
            <p className="form-subtitle">Start your 14-day premium architectural curation trial.</p>

            {displayError && <div className="error-box">{displayError}</div>}

            {/* Full Name */}
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="E.g. Julian Wright"
                className="field-input"
              />
            </div>

            {/* Work Email */}
            <div className="field-group">
              <label className="field-label">Work Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="julian@firm.com"
                className="field-input"
              />
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="field-input has-icon"
                />
                <button className="eye-btn" onClick={() => setShowPassword((v) => !v)} type="button">
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="field-hint">Min 8 chars with uppercase, lowercase, number, and symbol.</p>
            </div>

            {/* Checkbox */}
            <div className="checkbox-row">
              <input
                type="checkbox"
                className="checkbox-input"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label className="checkbox-label" htmlFor="agree">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </label>
            </div>

            <button onClick={handleSubmit} disabled={isLoading} className="btn-primary">
              {isLoading ? "Creating account..." : "Create Account"}
            </button>

            <div className="login-row">
              Already have an account?
              <Link to="/login">Log In</Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="reg-footer">
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

export default RegisterPage;