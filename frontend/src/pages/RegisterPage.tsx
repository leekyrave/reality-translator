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

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setValidationError("Hasło musi mieć co najmniej 8 znaków");
      return;
    }
    if (!/[a-z]/.test(form.password)) {
      setValidationError("Hasło musi zawierać co najmniej jedną małą literę");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setValidationError("Hasło musi zawierać co najmniej jedną wielką literę");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setValidationError("Hasło musi zawierać co najmniej jedną cyfrę");
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(form.password)) {
      setValidationError("Hasło musi zawierać co najmniej jeden znak specjalny");
      return;
    }

    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/workspace");
    } catch {
      // błąd obsługiwany w kontekście
    }
  };

  const displayError = validationError || error;

  return (
    <>
      <div className="reg-root">
        <div className="reg-main">

          <div className="reg-left">
            <div className="left-brand">AI-Kumpel</div>
            <h1 className="left-headline">Architektoniczna<br />Inteligencja.</h1>

            <div className="feature-card">
              <div className="feature-card-row">
                <span className="brand-logo">✦</span>
                <p className="feature-text">
                  Przekształć złożony żargon w <em>przejrzyste wnioski architektoniczne</em>.
                </p>
              </div>
              <div className="feature-dots">
                <div className="dot" />
                <div className="dot dot-sm" />
                <div className="dot dot-active dot-sm" />
              </div>
            </div>
          </div>

          <div className="reg-right">
            <h2 className="form-title">Utwórz obszar roboczy</h2>

            {displayError && <div className="error-box">{displayError}</div>}

            <div className="field-group">
              <label className="field-label">Imię i nazwisko</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="np. Jan Kowalski"
                className="field-input"
              />
            </div>

            <div className="field-group">
              <label className="field-label">E-mail służbowy</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jan@firma.pl"
                className="field-input"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Hasło</label>
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
              <p className="field-hint">Min. 8 znaków: wielka litera, mała litera, cyfra i znak specjalny.</p>
            </div>

            <button onClick={handleSubmit} disabled={isLoading} className="btn-primary">
              {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
            </button>

            <div className="login-row">
              Masz już konto?
              <Link to="/login">Zaloguj się</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
