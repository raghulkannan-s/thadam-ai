"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Roadmap, User } from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [goal, setGoal] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [difficulty, setDifficulty] = useState("Beginner");
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const me = await apiFetch<{ user: User }>("/api/auth/me");
      setUser(me.data.user);
      const list = await apiFetch<Roadmap[]>("/api/roadmaps");
      setRoadmaps(list.data);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await apiFetch<Roadmap>("/api/roadmaps/generate", {
        method: "POST",
        body: JSON.stringify({ goal, durationWeeks, difficulty }),
      });
      setRoadmaps((prev) => [response.data, ...prev]);
      setGoal("");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-600">
            {user
              ? `Welcome back, ${user.displayName || user.email}.`
              : "Sign in to continue."}
          </p>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={onGenerate}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Generate roadmap
          </h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                Learning goal
              </label>
              <textarea
                className="min-h-[120px] w-full rounded-lg border border-zinc-200 px-3 py-2"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                Duration (weeks)
              </label>
              <input
                type="number"
                min={1}
                max={52}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                value={durationWeeks}
                onChange={(event) =>
                  setDurationWeeks(Number(event.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                Difficulty
              </label>
              <select
                className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white"
            >
              Create roadmap
            </button>
          </div>
          {message && <p className="mt-4 text-sm text-zinc-700">{message}</p>}
        </form>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">Your roadmaps</h2>
          {roadmaps.length === 0 && (
            <p className="text-sm text-zinc-600">
              No roadmaps yet. Generate your first one.
            </p>
          )}
          <div className="space-y-4">
            {roadmaps.map((roadmap) => (
              <article
                key={roadmap.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {roadmap.title}
                    </h3>
                    <p className="text-sm text-zinc-600">{roadmap.goal}</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                    {roadmap.status}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {roadmap.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-zinc-100 p-3"
                    >
                      <h4 className="text-sm font-semibold text-zinc-900">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="mt-1 text-sm text-zinc-600">
                          {task.description}
                        </p>
                      )}
                      {task.expectedDays && (
                        <p className="mt-1 text-xs text-zinc-500">
                          Expected: {task.expectedDays} days
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
