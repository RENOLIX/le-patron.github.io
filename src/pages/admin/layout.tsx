import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth";
import { cn } from "@/lib/utils";
import type { BackofficeRole } from "@/types";

const NAV: Array<{
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: BackofficeRole[];
}> = [
  { label: "Produits", href: "/admin/products", icon: Package, roles: ["admin"] },
  { label: "Commandes", href: "/admin/orders", icon: ShoppingBag, roles: ["admin", "employee"] },
  { label: "Utilisateurs", href: "/admin/users", icon: Users, roles: ["admin"] },
];

function AdminNavLink({
  href,
  label,
  Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const active =
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <Link
      to={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-none px-4 py-3 text-sm transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const {
    loading,
    session,
    role,
    canAccessBackoffice,
    signOut,
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const visibleNav = useMemo(() => {
    if (!role) {
      return [];
    }

    return NAV.filter((entry) => entry.roles.includes(role));
  }, [role]);

  const currentSection = useMemo(() => {
    const current =
      visibleNav.find(
        (entry) =>
          location.pathname === entry.href ||
          location.pathname.startsWith(entry.href + "/"),
      ) ?? null;

    return current?.label ?? "Administration";
  }, [location.pathname, visibleNav]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Chargement de la session admin...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!canAccessBackoffice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <LayoutDashboard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 font-serif text-2xl font-bold">Acces refuse</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Ce compte est bien connecte, mais il n&apos;a aucun role back-office.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/" className="text-xs uppercase tracking-widest underline">
              Retour boutique
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-xs uppercase tracking-widest underline"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="space-y-2">
            <BrandLogo className="h-10 w-[124px]" />
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {currentSection}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu admin"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/45 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[60] flex w-[84vw] max-w-[320px] flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border p-6">
            <div className="space-y-3">
              <BrandLogo className="h-12 w-[144px]" />
              <div>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  Admin
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Role : {role === "admin" ? "Administrateur" : "Employe"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center border border-border lg:hidden"
              aria-label="Fermer le menu admin"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {visibleNav.map(({ label, href, icon: Icon }) => (
              <AdminNavLink
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                onNavigate={() => setMenuOpen(false)}
              />
            ))}
          </nav>

          <div className="space-y-3 border-t border-border p-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-none px-0 text-xs uppercase tracking-widest"
              onClick={() => void signOut()}
            >
              <LogOut className="h-4 w-4" /> Deconnexion
            </Button>
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              <Store className="h-4 w-4" /> Voir la boutique
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="hidden items-center gap-3 border-b border-border px-8 py-4 text-muted-foreground lg:flex">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.26em]">
              {currentSection}
            </span>
          </div>
          <div className="min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
