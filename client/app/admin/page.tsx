"use client";

export default function AdminPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-8">
      <div className="max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Admin console</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Admin moderation tools will connect to backend endpoints once the
          admin module is enabled.
        </p>
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
          Coming soon: spam removal, report review, and user moderation
          workflows.
        </div>
      </div>
    </div>
  );
}
