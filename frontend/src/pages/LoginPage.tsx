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
      // błąd obsługiwany w kontekście
    }
  };

  return (
    <>
      <div className="login-root">
        <div className="login-main">

          <div className="login-left">
            <h1 className="left-headline">Architektura<br />Inteligencji.</h1>
            <p className="left-sub">
              Wejdź do wyselekcjonowanego środowiska, gdzie klarowność struktury
              spotyka się z zaawansowaną kuratorką. Zarządzaj swoją architektoniczną
              inteligencją z AI-Kumplem.
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

          <div className="login-right">

            <div className="brand-row">
              <span className="brand-logo">✦</span>
              <span className="brand-name">AI-Kumpel</span>
            </div>

            <h2 className="form-title">Witaj ponownie</h2>
            <p className="form-subtitle">Podaj swoje dane logowania, aby uzyskać dostęp do obszaru roboczego.</p>

            {error && <div className="error-box">{error}</div>}

            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label">Adres e-mail</label>
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="imie@firma.pl"
                className="field-input"
              />
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label">Hasło</label>
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
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </button>

            <div className="signup-row">
              Nie masz konta?
              <Link to="/register">Zarejestruj się</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
