"use client";

import { useAuth } from "@/features/auth/context/auth-context";
import { PageLoader } from "@/shared/ui/LoadingSpinner";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import type { AdminUserResponse } from "@/lib/types";
import { Shield, MoreVertical, Coins, Trash2, Mail, Hash, Users } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [roleModal, setRoleModal] = useState<{ userId: string, name: string, role: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ userId: string, name: string } | null>(null);

  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [coinUserId, setCoinUserId] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [coinReason, setCoinReason] = useState<string>("");

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
    } else {
      setLoading(false);
    }
  }, [user, loadUsers]);

  const executeRoleChange = async () => {
    if (!roleModal) return;
    setUpdatingId(roleModal.userId);
    try {
      const res = await apiFetch<AdminUserResponse>(
        `/api/admin/users/${roleModal.userId}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: roleModal.role }),
        },
      );
      setUsers((prev) => prev.map((u) => (u.id === roleModal.userId ? res.data : u)));
      toast.success("Role updated successfully");
      setRoleModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const executeDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await apiFetch<AdminUserResponse>(`/api/admin/users/${deleteModal.userId}/blacklist`, {
        method: "POST",
      });
      setUsers((prev) => prev.map((u) => (u.id === deleteModal.userId ? res.data : u)));
      toast.success("User blacklisted successfully");
      setDeleteModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to blacklist user");
    }
  };

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinUserId) return;
    
    try {
      await apiFetch(`/api/admin/users/${coinUserId}/coins`, {
        method: "POST",
        body: JSON.stringify({ amount: coinAmount, reason: coinReason }),
      });
      toast.success("Coins adjusted successfully");
      setCoinModalOpen(false);
      setCoinUserId(null);
      setCoinAmount(0);
      setCoinReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust coins");
    }
  };

  if (isLoading || loading) return <PageLoader />;

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="premium-card p-10 max-w-md text-center animate-scale-in">
          <Shield className="h-12 w-12 text-[var(--accent-primary)] mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Moderator Dashboard</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Welcome to the Moderator Workspace. Use the sidebar to navigate to the roadmap moderation queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="animate-fade-in-up mb-4 flex-shrink-0">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">User Management</h1>
        <p className="mt-1 text-[var(--text-secondary)] text-sm max-w-2xl leading-relaxed">
          View all registered users, manage roles and permissions, adjust coin balances, and remove accounts if necessary.
        </p>
      </div>

      <div className="premium-card overflow-hidden animate-fade-in-up delay-100 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-2 font-semibold text-[10px] uppercase tracking-wider">User</th>
                <th className="px-4 py-2 font-semibold text-[10px] uppercase tracking-wider">Balance</th>
                <th className="px-4 py-2 font-semibold text-[10px] uppercase tracking-wider">Metrics</th>
                <th className="px-4 py-2 font-semibold text-[10px] uppercase tracking-wider">Role</th>
                <th className="px-4 py-2 font-semibold text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 font-semibold text-[10px] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-surface)]/50 transition-colors group">
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-primary)] whitespace-nowrap">{u.name}</span>
                      <span className="text-[var(--text-tertiary)] flex items-center gap-1.5 mt-0.5 text-xs truncate max-w-[150px] sm:max-w-[200px]" title={u.email}>
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20 text-xs font-bold shadow-sm whitespace-nowrap">
                      <Coins className="h-3 w-3 shrink-0" />
                      {u.coins ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                      <div>Roadmaps: <span className="font-bold text-[var(--text-primary)]">{u.roadmapCount ?? 0}</span></div>
                      <div>Forks: <span className="font-bold text-[var(--text-primary)]">{u.forkCount ?? 0}</span></div>
                      <div className="flex gap-2">
                        <span className="text-[var(--success)] flex items-center gap-0.5"><span className="text-[10px]">👍</span> {u.upvotes ?? 0}</span>
                        <span className="text-[var(--error)] flex items-center gap-0.5"><span className="text-[10px]">👎</span> {u.downvotes ?? 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={u.role}
                      onChange={(e) => setRoleModal({ userId: u.id, name: u.name, role: e.target.value })}
                      disabled={updatingId === u.id}
                      className={cn(
                        "appearance-none bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all cursor-pointer",
                        updatingId === u.id && "opacity-50 cursor-not-allowed"
                      )}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em"
                      }}
                    >
                      <option value="USER">LEARNER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider",
                      u.active 
                        ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20"
                        : "bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20"
                    )}>
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity whitespace-nowrap">
                      <button
                        onClick={() => {
                          setCoinUserId(u.id);
                          setCoinModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--warning)] hover:bg-[var(--warning)]/10 transition-colors"
                        title="Adjust Coins"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        Coins
                      </button>
                      <button
                        onClick={() => setDeleteModal({ userId: u.id, name: u.name })}
                        disabled={updatingId === u.id || u.id === user?.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.id === user?.id ? "Cannot blacklist yourself" : "Blacklist User"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Blacklist
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="p-12 text-center text-[var(--text-tertiary)] flex flex-col items-center justify-center">
              <Users className="h-8 w-8 mb-3 opacity-20" />
              <p>No users found in the system.</p>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Coins Modal */}
      {coinModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="premium-card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--warning)]/10 text-[var(--warning)]">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Adjust Ledger</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Modify coin balance for {users.find(u => u.id === coinUserId)?.name}.
                  <br />
                  <span className="font-semibold text-[var(--warning)] mt-1 inline-block">Current Balance: {users.find(u => u.id === coinUserId)?.coins ?? 0} coins</span>
                </p>
              </div>
            </div>
            
            <form onSubmit={handleAdjustCoins} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    required 
                    value={coinAmount} 
                    onChange={(e) => setCoinAmount(Number(e.target.value))} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all placeholder:text-[var(--text-tertiary)]"
                    placeholder="Enter amount..."
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[var(--text-tertiary)] text-xs font-semibold">
                    coins
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                  Use positive numbers to add, negative numbers to deduct.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Reason for Adjustment
                </label>
                <input 
                  type="text" 
                  required 
                  value={coinReason} 
                  onChange={(e) => setCoinReason(e.target.value)} 
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all placeholder:text-[var(--text-tertiary)]" 
                  placeholder="e.g. Admin Override, Reward" 
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] mt-6">
                <button 
                  type="button" 
                  onClick={() => setCoinModalOpen(false)} 
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 transition-colors shadow-lg shadow-[var(--accent-primary)]/20"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Role Change Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="premium-card w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Confirm Role Change</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Are you sure you want to change the role of <strong className="text-[var(--text-primary)]">{roleModal.name}</strong> to <strong className="text-[var(--accent-primary)]">{roleModal.role}</strong>? This will grant them new system permissions immediately.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <button 
                onClick={() => setRoleModal(null)} 
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeRoleChange} 
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 transition-colors shadow-lg"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="premium-card w-full max-w-md p-6 animate-scale-in border-2 border-[var(--error)]/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--error)]/10 text-[var(--error)]">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Blacklist User</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Are you sure you want to blacklist <span className="font-bold text-[var(--text-primary)]">{deleteModal.name}</span>? 
                  They will be prevented from logging in, and all of their roadmaps will be immediately made private.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <button 
                onClick={() => setDeleteModal(null)} 
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete} 
                className="px-4 py-2 bg-[var(--error)] hover:bg-[var(--error)]/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {updatingId === deleteModal.userId ? "Blacklisting..." : "Confirm Blacklist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
