import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoImg from "../../assets/logo.png";
import arebiLogo from "../../assets/arebi-logo.png";

export default function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Marketplace", icon: "storefront", show: true },
    {
      href: hasRole("manajemen") ? "/admin" : "/agent/dashboard",
      label: "Dashboard",
      icon: "dashboard",
      show: hasRole(["agent", "manajemen"]),
    },
  ].filter((l) => l.show);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
    setMobileOpen(false);
  };

  const roleLabel: Record<string, string> = {
    manajemen: "Manajemen",
    agent: "Agen",
    user: "User",
  };

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  return (
    <>
      <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 max-w-container-max mx-auto h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 flex-shrink-0"
              onClick={() => setMobileOpen(false)}
            >
              <img
                src={logoImg}
                className="h-14 sm:h-14 w-auto object-contain"
                alt="ALURA Logo"
              />
              <span className="w-px h-5 sm:h-6 bg-outline-variant" />
              <div className="flex flex-col items-center">
                <span className="font-mono text-[6px] font-bold text-black uppercase tracking-widest leading-none mb-0.5">
                  Member of
                </span>
                <img
                  src={arebiLogo}
                  className="h-10 sm:h-10 w-auto object-contain"
                  alt="AREBI Logo"
                  title="Anggota AREBI — Asosiasi Real Estate Broker Indonesia"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`font-mono text-xs tracking-widest uppercase transition-colors pb-1 ${
                    isActive(link.href)
                      ? "text-primary border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: desktop user info + hamburger */}
          <div className="flex items-center gap-2">
            {/* Desktop: user name + logout */}
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="font-body text-sm font-semibold text-on-surface leading-tight">
                    {user.name}
                  </span>
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">
                    {roleLabel[user.role] ?? user.role}
                  </span>
                </div>
                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="hidden md:flex w-9 h-9 rounded-full bg-primary-container border-2 border-outline-variant items-center justify-center hover:border-primary hover:bg-primary/10 transition-colors group"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-on-primary-container group-hover:text-primary text-[18px] transition-colors">
                    logout
                  </span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex bg-primary text-on-primary font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg hover:opacity-90 transition-opacity items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">
                  login
                </span>
                Login
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer (slide-down panel) ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-outline-variant bg-surface ${
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-4 space-y-1">
            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-mono text-sm font-bold tracking-wider uppercase transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-outline-variant my-2" />

            {/* User info / actions */}
            {user ? (
              <div className="space-y-1">
                {/* User identity */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-primary-container text-[16px]">
                      person
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-on-surface leading-tight truncate">
                      {user.name}
                    </p>
                    <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {roleLabel[user.role] ?? user.role}
                    </p>
                  </div>
                </div>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-mono text-sm font-bold tracking-wider uppercase text-status-error hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    logout
                  </span>
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary font-mono text-sm font-bold px-4 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">
                  login
                </span>
                Login Agen / Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop — tap to close */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
