import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import BrandLogo from "@/components/shop/BrandLogo";
import { useAuth } from "@/components/providers/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminResetPasswordPage() {
  const navigate = useNavigate();
  const {
    session,
    loading,
    isPasswordRecovery,
    updatePassword,
    clearPasswordRecovery,
    signOut,
  } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md border border-border bg-white/95 p-8 text-center shadow-[0_18px_50px_-32px_rgba(219,97,149,0.45)]">
          <BrandLogo className="mx-auto mb-5 h-14 w-[172px]" />
          <p className="text-sm text-muted-foreground">
            Verification du lien de reinitialisation...
          </p>
        </div>
      </div>
    );
  }

  if (!session && !isPasswordRecovery) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error);
        return;
      }

      clearPasswordRecovery();
      await signOut();
      toast.success("Mot de passe mis a jour. Reconnecte-toi avec le nouveau.");
      navigate("/admin/login", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md border border-border bg-white/95 p-8 shadow-[0_18px_50px_-32px_rgba(219,97,149,0.45)]">
        <div className="mb-8 text-center">
          <BrandLogo className="mx-auto mb-5 h-14 w-[172px]" />
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-border">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mb-2 font-serif text-3xl font-bold">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-muted-foreground">
            Definis un nouveau mot de passe pour retrouver l'acces a ton panel.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
              placeholder="Minimum 6 caracteres"
            />
          </div>

          <div className="space-y-1">
            <Label>Confirmer le mot de passe</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
              placeholder="Retape le mot de passe"
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Mise a jour..." : "Enregistrer le nouveau mot de passe"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/admin/login" className="underline">
            Retour a la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
