import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import BrandLogo from "@/components/shop/BrandLogo";
import { useAuth } from "@/components/providers/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BackofficeRole } from "@/types";

export default function AdminUsersPage() {
  const {
    user,
    isAdmin,
    adminUsers,
    loadingAdminUsers,
    createBackofficeUser,
    updateBackofficeUserRole,
    removeBackofficeUserAccess,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<BackofficeRole>("employee");
  const [submitting, setSubmitting] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const result = await createBackofficeUser({ email, password, role });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        result.needsEmailConfirmation
          ? "Utilisateur cree. Desactive Confirm email dans Supabase pour une connexion directe sans verification."
          : "Utilisateur ajoute. Il peut se connecter directement.",
      );
      setEmail("");
      setPassword("");
      setRole("employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, nextRole: BackofficeRole) => {
    const result = await updateBackofficeUserRole(userId, nextRole);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Role mis a jour.");
  };

  const handleRemove = async (userId: string, emailValue: string) => {
    if (!window.confirm(`Retirer l'acces de ${emailValue} ?`)) {
      return;
    }

    const result = await removeBackofficeUserAccess(userId);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Acces retire.");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 rounded-[28px] border border-border bg-white/80 p-5 shadow-[0_24px_70px_-52px_rgba(219,97,149,0.5)]">
        <div className="space-y-3">
          <BrandLogo className="h-12 w-[150px]" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Mina admin
            </p>
            <h1 className="font-serif text-2xl font-bold md:text-3xl">
              Utilisateurs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cree des acces back-office et attribue un role administrateur ou
              employe.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[28px] border border-border bg-white/80 p-5 shadow-[0_24px_70px_-54px_rgba(219,97,149,0.45)]">
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Nouvel acces
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold">
              Ajouter un utilisateur
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="employe@minaboutique.dz"
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Mot de passe temporaire</Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 caracteres"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Role</Label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as BackofficeRole)}
                className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="employee">Employe</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div className="rounded-[20px] border border-border bg-[#fff8fb] p-4 text-xs leading-relaxed text-muted-foreground">
              Le role <strong>administrateur</strong> peut gerer les produits,
              les commandes et les utilisateurs. Le role <strong>employe</strong>
              peut uniquement voir les commandes et imprimer les bordereaux.
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              <UserPlus className="h-4 w-4" />
              {submitting ? "Creation..." : "Creer l'utilisateur"}
            </Button>
          </form>
        </section>

        <section className="rounded-[28px] border border-border bg-white/80 p-5 shadow-[0_24px_70px_-54px_rgba(219,97,149,0.45)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Equipe back-office
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold">
                Comptes autorises
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#fff8fb] px-4 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              {adminUsers.length} compte(s)
            </div>
          </div>

          {loadingAdminUsers ? (
            <p className="text-sm text-muted-foreground">Chargement des utilisateurs...</p>
          ) : adminUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun utilisateur back-office trouve.
            </p>
          ) : (
            <div className="space-y-3">
              {adminUsers.map((adminUser) => {
                const isCurrentUser = adminUser.userId === user?.id;

                return (
                  <article
                    key={adminUser.userId}
                    className="rounded-[22px] border border-border bg-white/80 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">{adminUser.email}</p>
                          {isCurrentUser ? (
                            <span className="rounded-full border border-border bg-[#fff6fa] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              Ce compte
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Ajoute le{" "}
                          {new Intl.DateTimeFormat("fr-FR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(adminUser.createdAt))}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          value={adminUser.role}
                          onChange={(event) =>
                            void handleRoleChange(
                              adminUser.userId,
                              event.target.value as BackofficeRole,
                            )
                          }
                          className="min-w-[170px] rounded-none border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="employee">Employe</option>
                          <option value="admin">Administrateur</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => void handleRemove(adminUser.userId, adminUser.email)}
                          className="inline-flex items-center justify-center gap-2 border border-red-200 bg-red-50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Retirer l'acces
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
