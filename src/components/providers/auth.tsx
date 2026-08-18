import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { EmailOtpType, Session, User } from "@supabase/supabase-js";
import {
  createSecondarySupabaseClient,
  getPasswordRecoveryRedirectUrl,
  hasSupabaseConfig,
  supabase,
} from "@/lib/supabase";
import type { AdminUserRecord, BackofficeRole } from "@/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: BackofficeRole | null;
  isAdmin: boolean;
  isEmployee: boolean;
  canAccessBackoffice: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canUpdateOrders: boolean;
  isPasswordRecovery: boolean;
  loadingAdminUsers: boolean;
  adminUsers: AdminUserRecord[];
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  clearPasswordRecovery: () => void;
  signOut: () => Promise<void>;
  refreshAdminUsers: () => Promise<void>;
  createBackofficeUser: (input: {
    email: string;
    password: string;
    role: BackofficeRole;
  }) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  updateBackofficeUserRole: (
    userId: string,
    nextRole: BackofficeRole,
  ) => Promise<{ error: string | null }>;
  removeBackofficeUserAccess: (userId: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const RECOVERY_STORAGE_KEY = "__mina_supabase_recovery_payload";

function rowToAdminUser(row: Record<string, unknown>): AdminUserRecord {
  return {
    userId: String(row.user_id ?? ""),
    email: String(row.email ?? ""),
    role: String(row.role ?? "admin") as BackofficeRole,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

async function fetchAdminRoleRow(userId: string) {
  if (!supabase) {
    return { data: null, error: null as string | null };
  }

  const withRole = await supabase
    .from("admin_users")
    .select("user_id, email, role, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!withRole.error) {
    return { data: withRole.data, error: null as string | null };
  }

  const missingRoleColumn = withRole.error.message.toLowerCase().includes("role");
  if (!missingRoleColumn) {
    return { data: null, error: withRole.error.message };
  }

  const legacy = await supabase
    .from("admin_users")
    .select("user_id, email, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (legacy.error) {
    return { data: null, error: legacy.error.message };
  }

  return {
    data: legacy.data ? { ...legacy.data, role: "admin" } : null,
    error: null as string | null,
  };
}

async function fetchAdminUsersList() {
  if (!supabase) {
    return { data: [] as AdminUserRecord[], error: null as string | null };
  }

  const withRole = await supabase
    .from("admin_users")
    .select("user_id, email, role, created_at")
    .order("created_at", { ascending: false });

  if (!withRole.error) {
    return {
      data: (withRole.data ?? []).map((row) => rowToAdminUser(row as Record<string, unknown>)),
      error: null as string | null,
    };
  }

  const missingRoleColumn = withRole.error.message.toLowerCase().includes("role");
  if (!missingRoleColumn) {
    return { data: [] as AdminUserRecord[], error: withRole.error.message };
  }

  const legacy = await supabase
    .from("admin_users")
    .select("user_id, email, created_at")
    .order("created_at", { ascending: false });

  if (legacy.error) {
    return { data: [] as AdminUserRecord[], error: legacy.error.message };
  }

  return {
    data: (legacy.data ?? []).map((row) =>
      rowToAdminUser({ ...(row as Record<string, unknown>), role: "admin" }),
    ),
    error: null as string | null,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<BackofficeRole | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery") ||
      Boolean(window.sessionStorage.getItem(RECOVERY_STORAGE_KEY))
    );
  });

  const syncRole = useCallback(async (nextUser: User | null) => {
    if (!nextUser || !supabase) {
      setRole(null);
      setAdminUsers([]);
      return;
    }

    const { data, error } = await fetchAdminRoleRow(nextUser.id);

    if (error) {
      setRole(null);
      return;
    }

    setRole(data ? (String(data.role ?? "admin") as BackofficeRole) : null);
  }, []);

  const refreshAdminUsers = useCallback(async () => {
    if (!supabase || role !== "admin") {
      setAdminUsers([]);
      return;
    }

    setLoadingAdminUsers(true);

    const { data, error } = await fetchAdminUsersList();

    if (!error) {
      setAdminUsers(data);
    }

    setLoadingAdminUsers(false);
  }, [role]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const client = supabase;

    const bootstrapSession = async () => {
      const pendingRecovery =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(RECOVERY_STORAGE_KEY)
          : null;

      if (pendingRecovery) {
        const params = new URLSearchParams(pendingRecovery);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const tokenHash = params.get("token_hash");
        const authCode = params.get("code");
        const type = params.get("type");
        let recoveryReady = false;

        try {
          if (accessToken && refreshToken) {
            const { error } = await client.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            recoveryReady = !error;
          } else if (authCode) {
            const { error } = await client.auth.exchangeCodeForSession(authCode);
            recoveryReady = !error;
          } else if (tokenHash && type) {
            const { error } = await client.auth.verifyOtp({
              token_hash: tokenHash,
              type: type as EmailOtpType,
            });
            recoveryReady = !error;
          }
        } catch {
          // If the recovery token is invalid or expired, the login page remains the fallback.
        }

        if (type === "recovery" && mounted) {
          setIsPasswordRecovery(recoveryReady);
        }

        window.sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      }

      const { data } = await client.auth.getSession();

      if (!mounted) {
        return;
      }

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      await syncRole(data.session?.user ?? null);
      if (mounted) {
        setLoading(false);
      }
    };

    void bootstrapSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, nextSession) => {
      void (async () => {
        if (!mounted) {
          return;
        }

        setLoading(true);
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
        await syncRole(nextSession?.user ?? null);

        if (!mounted) {
          return;
        }

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
        }

        if (event === "SIGNED_OUT") {
          setIsPasswordRecovery(false);
          setAdminUsers([]);
        }

        if (event === "USER_UPDATED") {
          setIsPasswordRecovery(false);
        }

        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncRole]);

  useEffect(() => {
    if (role === "admin") {
      void refreshAdminUsers();
      return;
    }

    setAdminUsers([]);
  }, [refreshAdminUsers, role]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: "Supabase n'est pas configure." };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error?.message ?? null };
  };

  const sendPasswordResetEmail = async (email: string) => {
    if (!supabase) {
      return { error: "Supabase n'est pas configure." };
    }

    const redirectTo = getPasswordRecoveryRedirectUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    if (!supabase) {
      return { error: "Supabase n'est pas configure." };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (!error) {
      setIsPasswordRecovery(false);
    }

    return { error: error?.message ?? null };
  };

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setIsPasswordRecovery(false);
  };

  const createBackofficeUser = async (input: {
    email: string;
    password: string;
    role: BackofficeRole;
  }) => {
    if (!supabase || role !== "admin") {
      return {
        error: "Acces refuse.",
        needsEmailConfirmation: false,
      };
    }

    const worker = createSecondarySupabaseClient();
    if (!worker) {
      return {
        error: "Supabase n'est pas configure.",
        needsEmailConfirmation: false,
      };
    }

    const cleanEmail = input.email.trim().toLowerCase();

    const { data, error } = await worker.auth.signUp({
      email: cleanEmail,
      password: input.password,
    });

    if (error) {
      return {
        error: error.message,
        needsEmailConfirmation: false,
      };
    }

    if (!data.user?.id) {
      return {
        error: "Impossible de recuperer l'identifiant du nouvel utilisateur.",
        needsEmailConfirmation: false,
      };
    }

    const { error: accessError } = await supabase.from("admin_users").insert({
      user_id: data.user.id,
      email: cleanEmail,
      role: input.role,
    });

    if (accessError) {
      return {
        error: accessError.message,
        needsEmailConfirmation: false,
      };
    }

    await refreshAdminUsers();

    return {
      error: null,
      needsEmailConfirmation: !data.session,
    };
  };

  const updateBackofficeUserRole = async (
    userId: string,
    nextRole: BackofficeRole,
  ) => {
    if (!supabase || role !== "admin") {
      return { error: "Acces refuse." };
    }

    if (userId === user?.id && nextRole !== "admin") {
      return { error: "Tu ne peux pas retrograder ton propre compte." };
    }

    const { error } = await supabase
      .from("admin_users")
      .update({ role: nextRole })
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    await refreshAdminUsers();
    if (userId === user?.id) {
      setRole(nextRole);
    }

    return { error: null };
  };

  const removeBackofficeUserAccess = async (userId: string) => {
    if (!supabase || role !== "admin") {
      return { error: "Acces refuse." };
    }

    if (userId === user?.id) {
      return { error: "Tu ne peux pas supprimer ton propre acces." };
    }

    const { error } = await supabase.from("admin_users").delete().eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    await refreshAdminUsers();
    return { error: null };
  };

  const value = useMemo<AuthContextValue>(() => {
    const isAdmin = role === "admin";
    const isEmployee = role === "employee";

    return {
      user,
      session,
      loading,
      role,
      isAdmin,
      isEmployee,
      canAccessBackoffice: Boolean(role),
      canManageProducts: isAdmin,
      canManageOrders: isAdmin || isEmployee,
      canUpdateOrders: isAdmin,
      isPasswordRecovery,
      loadingAdminUsers,
      adminUsers,
      signIn,
      sendPasswordResetEmail,
      updatePassword,
      clearPasswordRecovery,
      signOut,
      refreshAdminUsers,
      createBackofficeUser,
      updateBackofficeUserRole,
      removeBackofficeUserAccess,
    };
  }, [
    adminUsers,
    clearPasswordRecovery,
    createBackofficeUser,
    loading,
    loadingAdminUsers,
    refreshAdminUsers,
    removeBackofficeUserAccess,
    role,
    sendPasswordResetEmail,
    session,
    signIn,
    signOut,
    updateBackofficeUserRole,
    updatePassword,
    user,
    isPasswordRecovery,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
