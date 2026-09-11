"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Cookie is set; send them to the admin dashboard.
        router.push("/CareersPage/admin");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({ message: "Login failed" }));
      setError(data.message || "Login failed");
    } catch (err) {
      console.error("[ADMIN_LOGIN_UI_ERR]", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-[#1e3143] mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          className="w-full px-3 py-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#1e3143] mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-[#aec2cc] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#1484bc]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-2 bg-[#1e3143] text-[#fafbf9] rounded-[4px] font-medium cursor-pointer hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
