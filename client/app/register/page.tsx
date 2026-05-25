"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await apiFetch<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
      });
      setUser(response.data.user);
      setMessage("Registration complete");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Create account</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Build your personalized AI learning roadmap.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Display name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white"
          >
            Create account
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-zinc-700">{message}</p>}
        {user && (
          <p className="mt-2 text-sm text-zinc-600">
            Welcome, {user.displayName || user.email}.
          </p>
        )}
        <p className="mt-6 text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-900">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
