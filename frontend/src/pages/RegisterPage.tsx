import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { Spinner } from "../components/ui/Spinner";

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
    } catch { /* error shown via context */ }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900">
            <span className="text-lg font-bold text-white">AI</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-500">Start building something great</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner size="sm" /> : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-gray-900 underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
