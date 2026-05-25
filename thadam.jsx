import { useState } from "react";

const tree = [
  {
    name: "roadmap-ai/",
    type: "root",
    desc: "Next.js 14 App Router · TypeScript · Prisma · PostgreSQL",
    children: [
      {
        name: "prisma/",
        type: "folder",
        tag: "DATABASE",
        tagColor: "#f59e0b",
        desc: "Schema, migrations, seed",
        children: [
          { name: "schema.prisma", type: "file", ext: "prisma", desc: "User, Roadmap, Node, Todo, Subscription models" },
          { name: "seed.ts", type: "file", ext: "ts", desc: "Demo data seeder" },
          {
            name: "migrations/",
            type: "folder",
            desc: "Auto-generated migration files",
            children: [
              { name: "0001_init.sql", type: "file", ext: "sql", desc: "Initial schema" },
              { name: "0002_add_todos.sql", type: "file", ext: "sql", desc: "Todo table migration" },
            ]
          }
        ]
      },
      {
        name: "app/",
        type: "folder",
        tag: "ROUTING",
        tagColor: "#6366f1",
        desc: "Next.js App Router — thin pages only, zero business logic",
        children: [
          { name: "layout.tsx", type: "file", ext: "tsx", desc: "Root layout — fonts, providers, toaster" },
          { name: "page.tsx", type: "file", ext: "tsx", desc: "Landing page — hero, features, pricing" },
          { name: "globals.css", type: "file", ext: "css", desc: "Tailwind base + CSS variables" },
          {
            name: "(auth)/",
            type: "folder",
            desc: "Route group — no URL segment",
            children: [
              {
                name: "login/",
                type: "folder",
                children: [{ name: "page.tsx", type: "file", ext: "tsx", desc: "Login form — Google + credentials" }]
              },
              {
                name: "register/",
                type: "folder",
                children: [{ name: "page.tsx", type: "file", ext: "tsx", desc: "Registration form + Zod validation" }]
              },
            ]
          },
          {
            name: "(protected)/",
            type: "folder",
            desc: "Auth-gated — single layout.tsx checks session",
            children: [
              { name: "layout.tsx", type: "file", ext: "tsx", desc: "Session check → redirect if unauthenticated" },
              {
                name: "dashboard/",
                type: "folder",
                children: [{ name: "page.tsx", type: "file", ext: "tsx", desc: "Overview — active roadmaps, todo summary, usage stats" }]
              },
              {
                name: "roadmaps/",
                type: "folder",
                children: [
                  { name: "page.tsx", type: "file", ext: "tsx", desc: "All roadmaps list — grid view" },
                  {
                    name: "new/",
                    type: "folder",
                    children: [{ name: "page.tsx", type: "file", ext: "tsx", desc: "Generate roadmap — prompt + config form" }]
                  },
                  {
                    name: "[id]/",
                    type: "folder",
                    children: [
                      { name: "page.tsx", type: "file", ext: "tsx", desc: "Roadmap visual tree — interactive node graph" },
                      {
                        name: "edit/",
                        type: "folder",
                        children: [{ name: "page.tsx", type: "file", ext: "tsx", desc: "Edit roadmap nodes, reorder, add custom steps" }]
                      }
                    ]
                  }
                ]
              },
              {
                name: "todos/",
                type: "folder",
                children: [
                  { name: "page.tsx", type: "file", ext: "tsx", desc: "All todos — filter by roadmap, status, priority" },
                  {
                    name: "[roadmapId]/",
                    type: "folder",
                    children: [{ name: "page.tsx", type: "file", ext: "tsx", desc: "Todos scoped to one roadmap" }]
                  }
                ]
              },
              {
                name: "settings/",
                type: "folder",
                children: [
                  { name: "page.tsx", type: "file", ext: "tsx", desc: "Profile, preferences, API usage" },
                  {
                    name: "billing/",
                    type: "folder",
                    children: [{ name: "page.tsx", type: "file", ext: "tsx", desc: "Plan, usage limits, payment history" }]
                  }
                ]
              },
              {
                name: "admin/",
                type: "folder",
                desc: "ADMIN role only — checked in layout",
                children: [
                  { name: "layout.tsx", type: "file", ext: "tsx", desc: "Role guard — ADMIN only or 403" },
                  { name: "page.tsx", type: "file", ext: "tsx", desc: "Admin dashboard — users, revenue, system stats" },
                  {
                    name: "users/",
                    type: "folder",
                    children: [{ name: "page.tsx", type: "file", ext: "tsx", desc: "User management — ban, promote, view usage" }]
                  }
                ]
              }
            ]
          },
          {
            name: "api/",
            type: "folder",
            tag: "API",
            tagColor: "#10b981",
            desc: "Thin route handlers — validate → call service → respond",
            children: [
              {
                name: "auth/",
                type: "folder",
                children: [
                  {
                    name: "[...nextauth]/",
                    type: "folder",
                    children: [{ name: "route.ts", type: "file", ext: "ts", desc: "NextAuth handler — Google + credentials providers" }]
                  }
                ]
              },
              {
                name: "roadmaps/",
                type: "folder",
                children: [
                  { name: "route.ts", type: "file", ext: "ts", desc: "GET all roadmaps · POST create roadmap" },
                  {
                    name: "[id]/",
                    type: "folder",
                    children: [
                      { name: "route.ts", type: "file", ext: "ts", desc: "GET · PATCH · DELETE single roadmap" },
                      {
                        name: "generate/",
                        type: "folder",
                        children: [{ name: "route.ts", type: "file", ext: "ts", desc: "POST → calls Gemini API → streams roadmap back" }]
                      },
                      {
                        name: "todos/",
                        type: "folder",
                        children: [{ name: "route.ts", type: "file", ext: "ts", desc: "GET todos for roadmap · POST new todo" }]
                      }
                    ]
                  }
                ]
              },
              {
                name: "todos/",
                type: "folder",
                children: [
                  { name: "route.ts", type: "file", ext: "ts", desc: "GET all todos · POST create" },
                  {
                    name: "[id]/",
                    type: "folder",
                    children: [{ name: "route.ts", type: "file", ext: "ts", desc: "PATCH status/priority · DELETE" }]
                  }
                ]
              },
              {
                name: "webhooks/",
                type: "folder",
                children: [
                  { name: "razorpay/", type: "folder", children: [{ name: "route.ts", type: "file", ext: "ts", desc: "Payment confirmed → upgrade plan in DB" }] },
                ]
              },
              {
                name: "admin/",
                type: "folder",
                children: [
                  { name: "users/", type: "folder", children: [{ name: "route.ts", type: "file", ext: "ts", desc: "Admin-only — manage users" }] },
                  { name: "stats/", type: "folder", children: [{ name: "route.ts", type: "file", ext: "ts", desc: "System-wide usage, revenue stats" }] },
                ]
              },
              {
                name: "cron/",
                type: "folder",
                children: [
                  { name: "reset-usage/", type: "folder", children: [{ name: "route.ts", type: "file", ext: "ts", desc: "Monthly — reset API usage counters" }] },
                  { name: "send-digest/", type: "folder", children: [{ name: "route.ts", type: "file", ext: "ts", desc: "Weekly — email todo digest to users" }] },
                ]
              }
            ]
          }
        ]
      },
      {
        name: "src/",
        type: "folder",
        tag: "APPLICATION",
        tagColor: "#ec4899",
        desc: "Your actual app — zero Next.js imports in services",
        children: [
          {
            name: "services/",
            type: "folder",
            tag: "CORE",
            tagColor: "#ef4444",
            desc: "All business logic — portable to Express tomorrow",
            children: [
              { name: "roadmap.service.ts", type: "file", ext: "ts", desc: "CRUD roadmaps, check ownership, usage limits" },
              { name: "todo.service.ts", type: "file", ext: "ts", desc: "CRUD todos, bulk operations, completion stats" },
              { name: "user.service.ts", type: "file", ext: "ts", desc: "Profile, plan management, usage tracking" },
              { name: "gemini.service.ts", type: "file", ext: "ts", desc: "Gemini API calls, prompt engineering, stream parsing" },
              { name: "email.service.ts", type: "file", ext: "ts", desc: "Resend integration — welcome, digest, alerts" },
              { name: "payment.service.ts", type: "file", ext: "ts", desc: "Razorpay orders, verify signatures, update plan" },
              { name: "admin.service.ts", type: "file", ext: "ts", desc: "User management, system stats, ban logic" },
            ]
          },
          {
            name: "components/",
            type: "folder",
            children: [
              {
                name: "ui/",
                type: "folder",
                desc: "Dumb, reusable — no business logic, no DB",
                children: [
                  { name: "button.tsx", type: "file", ext: "tsx", desc: "Variants: primary, ghost, danger, loading state" },
                  { name: "modal.tsx", type: "file", ext: "tsx", desc: "Accessible modal with backdrop" },
                  { name: "badge.tsx", type: "file", ext: "tsx", desc: "Status badges — color by variant" },
                  { name: "input.tsx", type: "file", ext: "tsx", desc: "Controlled input with error state" },
                  { name: "spinner.tsx", type: "file", ext: "tsx", desc: "Loading spinner variants" },
                  { name: "toast.tsx", type: "file", ext: "tsx", desc: "Success/error toast notifications" },
                ]
              },
              {
                name: "features/",
                type: "folder",
                desc: "Feature-scoped — knows about domain, not DB",
                children: [
                  {
                    name: "roadmap/",
                    type: "folder",
                    children: [
                      { name: "RoadmapCard.tsx", type: "file", ext: "tsx", desc: "Card with title, progress bar, node count" },
                      { name: "RoadmapTree.tsx", type: "file", ext: "tsx", desc: "Interactive visual node tree (react-flow)" },
                      { name: "RoadmapNode.tsx", type: "file", ext: "tsx", desc: "Single node — status, title, click to expand" },
                      { name: "GenerateForm.tsx", type: "file", ext: "tsx", desc: "Prompt input + config — calls /api/roadmaps/generate" },
                      { name: "StreamingOutput.tsx", type: "file", ext: "tsx", desc: "Renders Gemini stream in real time" },
                    ]
                  },
                  {
                    name: "todo/",
                    type: "folder",
                    children: [
                      { name: "TodoList.tsx", type: "file", ext: "tsx", desc: "Virtualized list — handles 1000+ todos" },
                      { name: "TodoItem.tsx", type: "file", ext: "tsx", desc: "Checkbox, priority badge, roadmap link" },
                      { name: "TodoFilters.tsx", type: "file", ext: "tsx", desc: "Filter by status, priority, roadmap, date" },
                      { name: "AddTodoForm.tsx", type: "file", ext: "tsx", desc: "Quick add inline form" },
                    ]
                  },
                  {
                    name: "dashboard/",
                    type: "folder",
                    children: [
                      { name: "StatsGrid.tsx", type: "file", ext: "tsx", desc: "Roadmaps created, todos done, streak" },
                      { name: "ProgressChart.tsx", type: "file", ext: "tsx", desc: "Weekly completion chart (recharts)" },
                      { name: "RecentActivity.tsx", type: "file", ext: "tsx", desc: "Last 5 actions feed" },
                    ]
                  },
                  {
                    name: "admin/",
                    type: "folder",
                    children: [
                      { name: "UsersTable.tsx", type: "file", ext: "tsx", desc: "Sortable, filterable user table" },
                      { name: "SystemStats.tsx", type: "file", ext: "tsx", desc: "Total users, revenue, API calls today" },
                    ]
                  },
                ]
              },
              {
                name: "layout/",
                type: "folder",
                children: [
                  { name: "Navbar.tsx", type: "file", ext: "tsx", desc: "Top nav — logo, user menu, notifications" },
                  { name: "Sidebar.tsx", type: "file", ext: "tsx", desc: "Collapsible — dashboard, roadmaps, todos, settings" },
                  { name: "MobileNav.tsx", type: "file", ext: "tsx", desc: "Bottom tab bar for mobile" },
                ]
              },
            ]
          },
          {
            name: "lib/",
            type: "folder",
            desc: "Utilities, clients, helpers",
            children: [
              { name: "db.ts", type: "file", ext: "ts", desc: "Prisma singleton — prevents hot-reload connection leak" },
              { name: "auth.ts", type: "file", ext: "ts", desc: "NextAuth config — providers, callbacks, JWT shape" },
              { name: "gemini.ts", type: "file", ext: "ts", desc: "Gemini client init — @google/generative-ai" },
              { name: "validations.ts", type: "file", ext: "ts", desc: "All Zod schemas — CreateRoadmap, CreateTodo, UpdateUser" },
              { name: "utils.ts", type: "file", ext: "ts", desc: "successResponse, errorResponse, paginate, cn()" },
              { name: "ratelimit.ts", type: "file", ext: "ts", desc: "In-memory rate limiter for Gemini API calls" },
              {
                name: "middleware/",
                type: "folder",
                children: [
                  { name: "withAuth.ts", type: "file", ext: "ts", desc: "Wraps route — 401 if no session" },
                  { name: "withRole.ts", type: "file", ext: "ts", desc: "Wraps route — 403 if role mismatch" },
                  { name: "withUsageLimit.ts", type: "file", ext: "ts", desc: "Blocks if free plan exceeded monthly limit" },
                ]
              },
            ]
          },
          {
            name: "types/",
            type: "folder",
            children: [
              { name: "index.ts", type: "file", ext: "ts", desc: "SafeUser, ApiResponse<T>, PaginatedResponse<T>, DTOs" },
              { name: "next-auth.d.ts", type: "file", ext: "ts", desc: "Extend Session with id, role, plan" },
              { name: "gemini.d.ts", type: "file", ext: "ts", desc: "RoadmapAIResponse, RoadmapNode, GenerateConfig" },
            ]
          },
          {
            name: "hooks/",
            type: "folder",
            desc: "Client-side only",
            children: [
              { name: "useRoadmaps.ts", type: "file", ext: "ts", desc: "SWR — fetch, mutate roadmaps list" },
              { name: "useTodos.ts", type: "file", ext: "ts", desc: "SWR — fetch, optimistic update todos" },
              { name: "useGenerate.ts", type: "file", ext: "ts", desc: "Stream Gemini response, track loading state" },
              { name: "useDebounce.ts", type: "file", ext: "ts", desc: "Debounce search inputs" },
            ]
          },
          {
            name: "config/",
            type: "folder",
            children: [
              { name: "index.ts", type: "file", ext: "ts", desc: "App name, URL, env flags, pagination defaults" },
              { name: "plans.ts", type: "file", ext: "ts", desc: "FREE (5 roadmaps), PRO (unlimited) — limits config" },
              { name: "prompts.ts", type: "file", ext: "ts", desc: "Gemini system prompt templates for roadmap generation" },
            ]
          },
        ]
      },
      {
        name: "middleware.ts",
        type: "file",
        ext: "ts",
        tag: "EDGE",
        tagColor: "#8b5cf6",
        desc: "Auth check + role-based redirect — runs before every request"
      },
      {
        name: "public/",
        type: "folder",
        desc: "Static assets",
        children: [
          { name: "logo.svg", type: "file", ext: "svg", desc: "Brand logo" },
          { name: "og-image.png", type: "file", ext: "png", desc: "Open Graph image for social sharing" },
        ]
      },
      { name: ".env.local", type: "file", ext: "env", desc: "DATABASE_URL, NEXTAUTH_SECRET, GEMINI_API_KEY, RAZORPAY_KEY" },
      { name: "next.config.ts", type: "file", ext: "ts", desc: "Image domains, env vars, headers" },
      { name: "tailwind.config.ts", type: "file", ext: "ts", desc: "Theme tokens, custom colors, font config" },
      { name: "tsconfig.json", type: "file", ext: "json", desc: "Strict mode on — paths alias @/ → src/" },
    ]
  }
];

const extColors = {
  ts: "#3b82f6",
  tsx: "#06b6d4",
  prisma: "#10b981",
  sql: "#f59e0b",
  css: "#a855f7",
  env: "#ef4444",
  json: "#f97316",
  svg: "#ec4899",
  png: "#84cc16",
  md: "#94a3b8",
};

const extBg = {
  ts: "#1e3a5f",
  tsx: "#0c3a4a",
  prisma: "#0a3a2a",
  sql: "#3a2a0a",
  css: "#2d1a4a",
  env: "#3a1a1a",
  json: "#3a2010",
  svg: "#3a0a2a",
  png: "#1e3a0a",
  md: "#1e2530",
};

function FileIcon({ ext }) {
  const color = extColors[ext] || "#94a3b8";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 20, height: 20, borderRadius: 4,
      background: extBg[ext] || "#1e2530",
      fontSize: 8, fontWeight: 800, color,
      letterSpacing: "-0.5px", flexShrink: 0,
      border: `1px solid ${color}22`
    }}>
      {ext?.toUpperCase().slice(0, 3)}
    </span>
  );
}

function FolderIcon({ open }) {
  return (
    <span style={{ fontSize: 14, flexShrink: 0 }}>
      {open ? "📂" : "📁"}
    </span>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
      padding: "2px 6px", borderRadius: 3,
      color, border: `1px solid ${color}55`,
      background: `${color}11`, flexShrink: 0
    }}>
      {label}
    </span>
  );
}

function TreeNode({ node, depth = 0, defaultOpen = false }) {
  const isRoot = depth === 0;
  const isFolder = node.type === "folder" || node.type === "root";
  const [open, setOpen] = useState(defaultOpen || depth < 2);

  const indent = depth * 16;

  return (
    <div>
      <div
        onClick={() => isFolder && setOpen(!open)}
        style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "5px 12px 5px",
          paddingLeft: 12 + indent,
          cursor: isFolder ? "pointer" : "default",
          borderRadius: 6,
          transition: "background 0.15s",
          background: isRoot ? "linear-gradient(90deg, #1e1b4b22, transparent)" : "transparent",
          marginBottom: isRoot ? 4 : 0,
        }}
        onMouseEnter={e => { if (!isRoot) e.currentTarget.style.background = "#ffffff08" }}
        onMouseLeave={e => { if (!isRoot) e.currentTarget.style.background = "transparent" }}
      >
        {/* Vertical line for depth */}
        {depth > 0 && (
          <div style={{
            position: "absolute",
            left: indent + 4,
            top: 0, bottom: 0,
            width: 1,
            background: "#ffffff08"
          }} />
        )}

        {/* Icon */}
        <div style={{ marginTop: 1, flexShrink: 0 }}>
          {isFolder
            ? <FolderIcon open={open} />
            : <FileIcon ext={node.ext} />
          }
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: isRoot ? 15 : 13,
              fontWeight: isRoot ? 700 : isFolder ? 600 : 400,
              color: isRoot ? "#e2e8f0" : isFolder ? "#c4b5fd" : "#94a3b8",
              letterSpacing: isRoot ? 0.5 : 0
            }}>
              {node.name}
            </span>
            {node.tag && <Tag label={node.tag} color={node.tagColor} />}
          </div>
          {node.desc && (
            <div style={{
              fontSize: 11, color: "#475569",
              marginTop: 1,
              fontFamily: "system-ui, sans-serif"
            }}>
              {node.desc}
            </div>
          )}
        </div>

        {/* Toggle arrow */}
        {isFolder && node.children?.length > 0 && (
          <span style={{
            fontSize: 10, color: "#334155",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            flexShrink: 0, marginTop: 3
          }}>▶</span>
        )}
      </div>

      {/* Children */}
      {isFolder && open && node.children && (
        <div style={{ position: "relative" }}>
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function DataFlow() {
  const steps = [
    { label: "Request", color: "#6366f1", icon: "🌐" },
    { label: "middleware.ts", color: "#8b5cf6", icon: "🛡️", sub: "Auth + Role" },
    { label: "app/(protected)/layout.tsx", color: "#a78bfa", icon: "🔒", sub: "Session guard" },
    { label: "page.tsx", color: "#c4b5fd", icon: "📄", sub: "Thin — calls service" },
    { label: "services/", color: "#10b981", icon: "⚙️", sub: "Business logic" },
    { label: "lib/db.ts", color: "#f59e0b", icon: "🔌", sub: "Prisma singleton" },
    { label: "PostgreSQL", color: "#3b82f6", icon: "🗄️", sub: "Your data" },
  ];
  return (
    <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#334155", marginBottom: 12 }}>
        DATA FLOW
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              padding: "4px 8px", borderRadius: 6,
              background: `${step.color}15`,
              border: `1px solid ${step.color}33`,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 12 }}>{step.icon}</div>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: step.color, fontWeight: 600 }}>
                {step.label}
              </div>
              {step.sub && <div style={{ fontSize: 8, color: "#475569" }}>{step.sub}</div>}
            </div>
            {i < steps.length - 1 && (
              <div style={{ color: "#334155", fontSize: 12 }}>→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { ext: "ts", label: "TypeScript" },
    { ext: "tsx", label: "React + TS" },
    { ext: "prisma", label: "Prisma Schema" },
    { ext: "sql", label: "SQL Migration" },
    { ext: "env", label: "Environment" },
    { ext: "css", label: "Styles" },
  ];
  return (
    <div style={{
      display: "flex", gap: 12, flexWrap: "wrap",
      padding: "12px 20px", borderTop: "1px solid #1e293b"
    }}>
      {items.map(item => (
        <div key={item.ext} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <FileIcon ext={item.ext} />
          <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>
            .{item.ext}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState("");

  return (
    <div style={{
      background: "#050a14",
      minHeight: "100vh",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#e2e8f0",
      padding: "24px 16px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18
          }}>🗺️</div>
          <div>
            <div style={{
              fontSize: 20, fontWeight: 800, letterSpacing: -0.5,
              fontFamily: "'JetBrains Mono', monospace",
              background: "linear-gradient(90deg, #e2e8f0, #6366f1)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              roadmap-ai
            </div>
            <div style={{ fontSize: 11, color: "#475569" }}>
              Production SaaS · Next.js 14 · TypeScript · Prisma · PostgreSQL · Gemini API
            </div>
          </div>
        </div>

        {/* Tech pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {[
            ["Next.js 14", "#000"],
            ["TypeScript", "#3b82f6"],
            ["Prisma ORM", "#10b981"],
            ["PostgreSQL", "#336791"],
            ["NextAuth v5", "#6366f1"],
            ["Gemini API", "#f59e0b"],
            ["Zod", "#ef4444"],
            ["SWR", "#000"],
            ["Razorpay", "#8b5cf6"],
            ["Resend", "#ec4899"],
            ["Tailwind", "#06b6d4"],
            ["react-flow", "#10b981"],
          ].map(([name, color]) => (
            <span key={name} style={{
              fontSize: 10, fontWeight: 600, padding: "3px 8px",
              borderRadius: 20, border: `1px solid ${color}44`,
              color, background: `${color}11`
            }}>{name}</span>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        background: "#0a1628",
        border: "1px solid #1e293b",
        borderRadius: 16, overflow: "hidden"
      }}>
        {/* Card header */}
        <div style={{
          padding: "12px 20px",
          borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", gap: 8,
          background: "#0d1f38"
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ef4444", "#f59e0b", "#10b981"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{
            fontSize: 11, color: "#475569",
            fontFamily: "'JetBrains Mono', monospace", marginLeft: 8
          }}>
            ~/projects/roadmap-ai — folder structure
          </span>
        </div>

        {/* Tree */}
        <div style={{ padding: "12px 0" }}>
          {tree.map((node, i) => (
            <TreeNode key={i} node={node} depth={0} defaultOpen />
          ))}
        </div>

        <Legend />
        <DataFlow />
      </div>

      {/* Key rules */}
      <div style={{ maxWidth: 900, margin: "20px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {[
          {
            icon: "⚙️", title: "Services have zero Next.js imports",
            desc: "Every file in src/services/ uses only Prisma and TypeScript. Portable to Express in one day.",
            color: "#10b981"
          },
          {
            icon: "📄", title: "Pages are always thin",
            desc: "app/**/page.tsx calls one service function and passes result to a component. No logic inline.",
            color: "#6366f1"
          },
          {
            icon: "🛡️", title: "Three layers of auth",
            desc: "middleware.ts → layout.tsx → API route. Each layer catches what the previous missed.",
            color: "#8b5cf6"
          },
          {
            icon: "✅", title: "All input goes through Zod",
            desc: "Every API route validates with a Zod schema before touching services or DB. No raw data passes through.",
            color: "#ef4444"
          },
        ].map((rule, i) => (
          <div key={i} style={{
            padding: "14px 16px",
            background: "#0a1628",
            border: `1px solid ${rule.color}22`,
            borderRadius: 12,
            borderLeft: `3px solid ${rule.color}`
          }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{rule.icon}
              <span style={{
                fontSize: 12, fontWeight: 700, color: rule.color,
                marginLeft: 8, fontFamily: "monospace"
              }}>{rule.title}</span>
            </div>
            <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>{rule.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
