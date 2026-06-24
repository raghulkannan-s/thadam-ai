"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { useTakeoffNavigation } from "../hooks/useTakeoffNavigation";

export default function LandingNavbar() {
  const { user } = useAuth();
  const handleTakeoff = useTakeoffNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-nav__inner">
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
            }}
          >
            <img
              src="/assets/logo-no-bg.png"
              alt="Thadam AI Logo"
              style={{
                width: 57,
                height: 57,
                objectFit: "contain",
              }}
            />
            <span
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Thadam
            </span>
          </Link>

          {/* Desktop Navigation (Removed to focus on downward journey) */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          </div>

          {/* Desktop Actions */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <a href="/community" className="cta-primary" style={{ padding: "8px 20px", fontSize: "0.8rem" }} onClick={(e) => handleTakeoff(e, "/community")}>
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  onClick={(e) => handleTakeoff(e, "/login")}
                >
                  Sign in
                </a>
                <a href="/register" className="cta-primary" style={{ padding: "8px 20px", fontSize: "0.8rem" }} onClick={(e) => handleTakeoff(e, "/register")}>
                  Get Started
                </a>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav-mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: 56,
              left: 0,
              right: 0,
              zIndex: 99,
              background: "var(--bg-base)",
              borderBottom: "1px solid var(--border-default)",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Navigation links removed to focus on downward journey */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {user ? (
                <a href="/community" className="cta-primary" style={{ textAlign: "center" }} onClick={(e) => handleTakeoff(e, "/community")}>
                  Dashboard
                </a>
              ) : (
                <>
                  <a href="/login" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none" }} onClick={(e) => handleTakeoff(e, "/login")}>
                    Sign in
                  </a>
                  <a href="/register" className="cta-primary" style={{ textAlign: "center" }} onClick={(e) => handleTakeoff(e, "/register")}>
                    Get Started
                  </a>
                </>
              )}
            </div>
            <div style={{ maxWidth: 200 }}>
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-desktop {
            display: none !important;
          }
          .nav-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
