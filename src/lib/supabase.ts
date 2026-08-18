import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const configuredSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
const supabaseUrl = rawSupabaseUrl?.replace(/\/rest\/v1\/?$/, "");
const defaultProductionSiteUrl = "https://www.mina-boutique.store/";

export const hasSupabaseConfig = Boolean(
  supabaseUrl && supabasePublishableKey,
);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function createSecondarySupabaseClient() {
  if (!hasSupabaseConfig || !supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function getPasswordRecoveryRedirectUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  const { protocol, hostname, origin, pathname } = window.location;

  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return defaultProductionSiteUrl;
  }

  return `${origin}${pathname}`;
}
