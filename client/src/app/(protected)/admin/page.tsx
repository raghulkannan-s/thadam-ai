"use client";

import { useAuth } from "@/features/auth/context/auth-context";
import { PageLoader, Spinner } from "@/shared/ui/LoadingSpinner";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import type { AdminUserResponse } from "@/lib/types";

export default function AdminPage() {
  const { user, isLoading } = useAuth();

  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const res = await apiFetch<AdminUserResponse[]>("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadUsers();
    } else if (user && user.role !== "ADMIN") {
      setLoading(false);
    }
  }, [user, loadUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await apiFetch<AdminUserResponse>(
        `/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: newRole }),
        },
      );
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
      toast.success("Role updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  if (isLoading) return <PageLoader />;

  if (user && user.role !== "ADMIN") {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          className="panel animate-scale-in"
          style={{
            maxWidth: "420px",
            borderRadius: "var(--radius-2xl)",
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "12px",
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px 24px 80px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <div className="animate-fade-in-up" style={{ marginBottom: "32px" }}>
        <div className="badge badge-accent" style={{ marginBottom: "16px" }}>
          Admin workspace
        </div>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          User Management
        </h1>
        <p
          style={{
            marginTop: "8px",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          View, manage roles, and remove users.
        </p>
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Spinner size={32} />
        </div>
      ) : (
        <div className="table-container animate-fade-in-up delay-200">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {u.id}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={updatingId === u.id}
                      className="input"
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.78rem",
                        width: "auto",
                        minWidth: "100px",
                      }}
                    >
                      <option value="USER">LEARNER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.active ? "badge-success" : "badge-error"}`}
                    >
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={updatingId === u.id || u.id === user?.id}
                      className="btn btn-ghost"
                      style={{
                        color: "var(--error)",
                        fontSize: "0.78rem",
                        padding: "4px 12px",
                        opacity: u.id === user?.id ? 0.4 : 1,
                      }}
                      title={
                        u.id === user?.id
                          ? "Cannot delete yourself"
                          : "Delete user"
                      }
                    >
                      {updatingId === u.id ? "" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-tertiary)",
                fontSize: "0.85rem",
              }}
            >
              No users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
