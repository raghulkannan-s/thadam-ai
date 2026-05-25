import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50">
      <main className="w-full max-w-4xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Thadam AI
          </p>
          <h1 className="text-4xl font-semibold text-zinc-900">
            Build AI learning roadmaps with accountability baked in.
          </h1>
          <p className="text-base text-zinc-600">
            Generate structured learning plans, track tasks, and stay consistent
            with community-driven accountability.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800"
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800"
          >
            Admin
          </Link>
        </div>
      </main>
    </div>
  );
}
