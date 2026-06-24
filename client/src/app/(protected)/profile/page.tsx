"use client";

import { useAuth } from "@/features/auth/context/auth-context";

import Link from "next/link";
import { PageLoader } from "@/shared/ui/LoadingSpinner";
import { Avatar } from "@/shared/ui/Avatar";
import { Button } from "@/shared/ui/Button";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const { user, isLoading: authLoading, refresh } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (authLoading) return <PageLoader />;
  if (!user) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Create a FormData to send to an external cloud or our backend
      // Here we simulate an upload by converting to base64 for now, or using a mock cloud
      // Ideally this goes to Cloudinary or S3
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Update user profile via PATCH /api/user/me
        await apiFetch("/api/user/me", {
          method: "PATCH",
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            avatarUrl: base64String // In a real app with "some cloud", you'd put the returned Cloudinary URL here
          })
        });

        toast.success("Profile photo updated successfully!");
        await refresh();
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      toast.error("Failed to upload photo");
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: "32px 40px 80px", maxWidth: 700, margin: "0 auto" }}>
      <div className="animate-fade-in-up">
        <p className="badge badge-accent" style={{ marginBottom: "16px" }}>Profile</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Your Account</h1>
      </div>

      <div className="panel animate-fade-in-up delay-100" style={{ borderRadius: "var(--radius-2xl)", padding: "32px", marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar 
              src={user.avatarUrl} 
              fallback={user.name || user.email} 
              size="xl" 
              className={`h-24 w-24 border-4 border-[var(--bg-base)] shadow-xl ${isUploading ? 'opacity-50' : 'group-hover:opacity-80 transition-opacity'}`}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-white text-xs font-bold drop-shadow-md">Change</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
              </div>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>{user.email}</p>
            <span className="badge badge-accent" style={{ marginTop: "6px", display: "inline-block" }}>{user.role === 'USER' ? 'LEARNER' : user.role}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
        <Link href="/community" className="panel" style={{
          borderRadius: "var(--radius-xl)", padding: "20px 24px",
          textDecoration: "none", display: "flex", alignItems: "center", gap: "14px",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
          </div>
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>Explore</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Community</p>
          </div>
        </Link>

        <Link href="/people" className="panel" style={{
          borderRadius: "var(--radius-xl)", padding: "20px 24px",
          textDecoration: "none", display: "flex", alignItems: "center", gap: "14px",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>Connect</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>People</p>
          </div>
        </Link>
      </div>

      <div className="panel animate-fade-in-up delay-200" style={{ borderRadius: "var(--radius-xl)", padding: "24px", marginTop: "24px" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>Account Details</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "Name", value: user.name },
            { label: "Email", value: user.email },
            { label: "Role", value: user.role === 'USER' ? 'LEARNER' : user.role },
            { label: "User ID", value: `#${user.id}` },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
